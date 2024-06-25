from infrastructure.apiDetails import apiDetails
from infrastructure.database import database
import logging
from datetime import datetime
import os
import sys

servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")
current_dir = os.path.dirname(sys.executable)
log_dir = os.path.join(current_dir,"E-WAY_BILL_PDF")
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

class ewbDatamodel:

    # Generate E-Way Bill
    def getHeaderData():
        return database.executeHeaderDBQuery()

    def getLineItemData(document_No):
        return database.executeLineDBQuery(document_No)
    
    def executeClearTaxEWBapi(payload,gstIn):
        return apiDetails.InvokeClearTaxGenerateEWBAPI(payload,gstIn)
    
    def createEWBpdfFile(ewbNo, gstIn, documentNo, ewbType):
        try:    
            current_time = datetime.now().strftime("%d%m%Y_%H%M%S")
            if ewbType == 'CANCELLED':
                file = os.path.join(log_dir,f"EWB_{ewbType}_{ewbNo}_{current_time}.pdf")
            elif ewbType == 'GENERATED':  
                file = os.path.join(log_dir,f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}.pdf")
            elif ewbType == 'UPDATE':
                file = os.path.join(log_dir,f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}.pdf")
            else:
                file = os.path.join(log_dir,f"E_WAY_BILL_{current_time}.pdf")

            servicelogger_info.info(f"File Path: {file}")
            responsePdf = apiDetails.printEwbPDF(ewbNo, gstIn)
            pdfContent = responsePdf.content
            if pdfContent:
                # Write the PDF content to a file
                with open(file, "wb") as file:
                    file.write(pdfContent)
                    servicelogger_info.info(f"PDF file saved for document No : {documentNo}")
 
        except Exception as e :
            servicelogger_error.exception("Exception Occured to call method for pdf file:")

    def saveResponse(response_data, res_status_code, payload, gstIn):
        try:
            DocumentNumber = response_data.get('ewb_request', {}).get("DocumentNumber", '')
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                Gstin_s = response_data.get('ewb_request', {}).get('SellerDtls', {}).get("Gstin", '')
                
                Success = response_data.get('govt_response', {}).get("Success", '')
                TotalInvoiceAmount = response_data.get('ewb_request', {}).get("TotalInvoiceAmount", '')
                if Success == "Y":
                    Status = response_data.get('govt_response', {}).get("Status", '')
                    EwbNo = response_data.get('govt_response', {}).get("EwbNo", '')
                    EwbDt = response_data.get('govt_response', {}).get("EwbDt", '')
                    EwbValidTill = response_data.get('govt_response', {}).get("EwbValidTill", '')
                    servicelogger_info.info(f"... Success Response from ClearTax EWB generation for Document Number {DocumentNumber}...\n")
                    ewbType = "GENERATED"
                    ewbDatamodel.createEWBpdfFile(EwbNo, gstIn, DocumentNumber, ewbType)
                    database.persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill,DocumentNumber, payload, response_data, gstIn)

                elif Success == "N" :
                    error_details = response_data.get("govt_response", {}).get("ErrorDetails", [])
                    fail_status = "FAILURE"
                    for error in error_details:
                        error_code = error.get("error_code")
                        error_message = error.get("error_message")
                        error_source = error.get("error_source")
                    servicelogger_info.info(f"... Failure Response from ClearTax EWB generation for Document Number {DocumentNumber}...\n")
                    database.persistFailureResponseInDB(fail_status,error_message, error_code, error_source, DocumentNumber, payload, response_data)

            else:  
                fail_status = "FAILURE"
                errorSource = response_data.get("error_source", '')
                errorCode = response_data.get("error_code", '')
                errorMessage = response_data.get("error_message", '')
                servicelogger_info.info(f"... Failure Response from ClearTax EWB generation for Document Number {DocumentNumber}...\n")
                database.persistFailureResponseInDB(fail_status, errorMessage, errorCode, errorSource, DocumentNumber, payload, response_data)

        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response for generate EWB :\n ")

    # Cancel E-Way Bill
    def getCancelEWBHeaderData():
        return database.executeCancelEWBHeaderQuery()
    
    def executeCancelEWBClearTaxEWBapi(cancelEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxCancelEWB(cancelEWBpayload, gstIn)
    
    def cancelEWBsaveResponse(response_data, res_status_code, cancelEWBpayload, ewbNo):
        try:
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                gstin = response_data.get("gstin", '')
                irn = response_data.get("irn", '')
                ewbNumber = response_data.get("ewbNumber", '')
                ewbStatus = response_data.get("ewbStatus", '')
                errorDetails = response_data.get("errorDetails", '')
                servicelogger_info.info("... Success Response from ClearTax EWB cancellation...\n")
                if errorDetails == None:
                    ewbType = "CANCELLED"
                    DocumentNumber = None
                    ewbDatamodel.createEWBpdfFile(ewbNumber, gstin, DocumentNumber, ewbType)
                    database.persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus, cancelEWBpayload, response_data)

                else :
                    error_message = response_data.get("errorDetails", {}).get("error_message", '')
                    fail_status = "FAILURE"
                    servicelogger_info.info("... Failure Response from ClearTax EWB cancellation...\n")
                    database.persistCancelEWBFailureResponseInDB(fail_status,error_message, cancelEWBpayload, response_data, ewbNo)
                   
            else:
                fail_status = "FAILURE"
                error_message = response_data.get("error_message", '')
                servicelogger_info.info("... Failure Response from ClearTax EWB cancellation...\n")
                database.persistCancelEWBFailureResponseInDB(fail_status,error_message, cancelEWBpayload, response_data, ewbNo)
        
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response for cancel EWB :\n ")

    # Update E-Way Bill
    def getUpdateEWBHeaderData():
        return database.executeUpdateEWBHeaderQuery()
    
    def executeUpdateEWBClearTaxEWBapi(updateEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn)
    
    def saveResponseUpdateEWB(response_data, res_status_code, updateEWBpayload, ewbNo, usergstIn, documentNo):
        try:
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                errors = response_data.get("errors", '')
                if errors == None:
                    EwbNo = response_data.get("EwbNumber", '')
                    UpdatedDate = response_data.get("UpdatedDate", '')
                    ValidUpto = response_data.get("ValidUpto", '')
                    servicelogger_info.info("... Success Response from ClearTax EWB update...\n")
                    ewbType = "UPDATE"
                    ewbDatamodel.createEWBpdfFile(EwbNo, usergstIn, documentNo, ewbType)
                    database.persistUpdateEWBSuccessResponseInDB(EwbNo, UpdatedDate, ValidUpto, updateEWBpayload, response_data)

                else:
                    error_details = response_data.get("errors", [])
                    
                    for error in error_details:
                        error_message = error.get("error_message")
                    fail_status = "FAILURE"
                    servicelogger_info.info("... Failure Response from ClearTax EWB update...\n")
                    database.persistUpdateEWBFailureResponseInDB(error_message, updateEWBpayload, response_data, ewbNo)
                
            else:
                msg_values = [error["error_message"] for error in response_data["errors"]]
                all_msg_values = ", ".join(msg_values)
                servicelogger_info.info("... Failure Response from ClearTax EWB update...\n")
                database.persistUpdateEWBFailureResponseInDB(all_msg_values, updateEWBpayload, response_data, ewbNo)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response for update EWB :\n ")
