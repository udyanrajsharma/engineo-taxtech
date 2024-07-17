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
    
    def preparedEWBNonIRNpayload(row):
        document_No = row[0]
        LineItem_data = ewbDatamodel.getLineItemData(document_No) # Get the line item data
        total_assessable_Amount = 0.00
        total_Invoice_Amount = 0.00
        cgst_amount = 0.00
        sgst_amount = 0.00
        igst_amount = 0.00
        cess_amount = 0.00
        cess_NonAdvol_amount = 0.00

        gstIn = row[14]
        payload = {
        "DocumentNumber": row[0],
        "DocumentType": row[2],
        "DocumentDate": row[1],
        "SupplyType": row[3],
        "SubSupplyType": row[4],
        "SubSupplyTypeDesc": row[5],
        "TransactionType": row[6],
        "BuyerDtls": {
            "Gstin": row[7],
            "LglNm": row[8],
            "TrdNm": "",
            "Addr1": row[9],
            "Addr2": row[10],
            "Loc": row[11],
            "Pin": row[12],
            "Stcd": row[13]
        },
        "SellerDtls": {
            "Gstin": row[14],
            "LglNm": row[15],
            "TrdNm": "",
            "Addr1": row[16],
            "Addr2": row[17],
            "Loc": row[18],
            "Pin": row[19],
            "Stcd": row[20]
        },
        "ExpShipDtls": {
            "LglNm": row[21],
            "Addr1": row[22],
            "Addr2": row[23],
            "Loc": row[24],
            "Pin": row[25],
            "Stcd": row[26]
        },
        "DispDtls": {
            "Nm": "",
            "Addr1": "",
            "Addr2": "",
            "Loc": "",
            "Pin": "",
            "Stcd": ""
        },
        "ItemList": [   
        ],
        "TotalInvoiceAmount": "",
        "TotalCgstAmount": "",
        "TotalSgstAmount": "",
        "TotalIgstAmount": "",
        "TotalCessAmount": "",
        "TotalCessNonAdvolAmount": "",
        "TotalAssessableAmount": "",
        "OtherAmount": "",
        "OtherTcsAmount": "",
        "TransId": row[27],
        "TransName": row[28],
        "TransMode": row[29],
        "Distance": row[30],
        "TransDocNo": row[31],
        "TransDocDt": row[32],
        "VehNo": row[33],
        "VehType": row[34]
        }
        for items in LineItem_data:
            total_assessable_Amount += float(items[5])
            cgst_amount += float(items[7])
            sgst_amount += float(items[9])
            igst_amount += float(items[11])
            cess_amount += float(items[13])
            cess_NonAdvol_amount += float(items[15])
            
            payload["ItemList"].append  ({
                "ProdName": items[0],
                "ProdDesc": items[1],
                "HsnCd": items[2],
                "Qty": items[3],
                "Unit": items[4],
                "AssAmt": items[5],
                "CgstRt": items[6],
                "CgstAmt": items[7],
                "SgstRt": items[8],
                "SgstAmt": items[9],
                "IgstRt": items[10],
                "IgstAmt": items[11],
                "CesRt": items[12],
                "CesAmt": items[13],
                "OthChrg": items[14],
                "CesNonAdvAmt": items[15]
        })       
        payload["TotalCgstAmount"] = cgst_amount
        payload["TotalSgstAmount"] = sgst_amount
        payload["TotalIgstAmount"] = igst_amount
        payload["TotalCessAmount"] = cess_amount
        payload["TotalCessNonAdvolAmount"] = cess_NonAdvol_amount
        payload["TotalAssessableAmount"] = total_assessable_Amount
        total_Invoice_Amount = total_assessable_Amount + cgst_amount + sgst_amount + igst_amount + cess_amount + cess_NonAdvol_amount
        payload["TotalInvoiceAmount"] = total_Invoice_Amount
        servicelogger_info.info("...Payload for generate EWB created...\n")
        return payload, gstIn

    def createEWBpdfFile(ewbNo, gstIn, documentNo, ewbType):
        try:    
            current_time = datetime.now().strftime("%d%m%Y_%H%M")
            if ewbType == 'CANCELLED':
                file = os.path.join(log_dir,f"EWB_{ewbType}_{ewbNo}_{current_time}.pdf")
                fileName = f"EWB_{ewbType}_{ewbNo}_{current_time}"
            elif ewbType == 'GENERATED':  
                file = os.path.join(log_dir,f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}.pdf")
                fileName = f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}"
            elif ewbType == 'UPDATE':
                file = os.path.join(log_dir,f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}.pdf")
                fileName = f"EWB_{ewbType}_{documentNo}_{ewbNo}_{current_time}"
            else:
                file = os.path.join(log_dir,f"E_WAY_BILL_{current_time}.pdf")
                fileName = f"E_WAY_BILL_{current_time}"

            servicelogger_info.info(f"File Path: {file}")
            responsePdf = apiDetails.printEwbPDF(ewbNo, gstIn)
            pdfContent = responsePdf.content
            if pdfContent:
                # Write the PDF content to a file
                with open(file, "wb") as file:
                    file.write(pdfContent)
                    servicelogger_info.info(f"PDF file Name {fileName} saved for document No : {documentNo}")
            
            return fileName
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
                    pdfFileName = ewbDatamodel.createEWBpdfFile(EwbNo, gstIn, DocumentNumber, ewbType)
                    database.persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill,DocumentNumber, payload, response_data, gstIn, pdfFileName)

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

    def payloadCreationEWBNonIRNexceptionFailureResponse(ewbNum, exceptionMessage):
        try:
            status = "FAILURE"
            servicelogger_info.info(f"Exception Message: {exceptionMessage}")
            database.persistExceptionFailureResponseInDBForEWBNonIrnPayload(status, ewbNum, exceptionMessage)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response of Exception message on payoad creation: \n")

    # Cancel E-Way Bill
    def getCancelEWBHeaderData():
        return database.executeCancelEWBHeaderQuery()
    
    def executeCancelEWBClearTaxEWBapi(cancelEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxCancelEWB(cancelEWBpayload, gstIn)
    
    def preparedCancelEWBpayload(row):
        gstIn = row[1]
        ewbNumber = row[0]
        cancelEWBpayload = {
            "ewbNo": row[0],
            "cancelRsnCode": row[2],
            "cancelRmrk" : row[3]
        }
        servicelogger_info.info("...Payload for cancel EWB created...\n")
        return cancelEWBpayload, gstIn, ewbNumber
    
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
                    pdfFileName = ewbDatamodel.createEWBpdfFile(ewbNumber, gstin, DocumentNumber, ewbType)
                    database.persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus, cancelEWBpayload, response_data, pdfFileName)

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

    def payloadCreationCancelEWBNonIRNexceptionFailureResponse(ewbNum, exceptionMessage):
        try:
            status = "FAILURE"
            database.persistExceptionFailureResponseInDBForCancelEWBpayload(status, ewbNum, exceptionMessage)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response of Exception message on payoad creation: \n")


    # Update E-Way Bill
    def getUpdateEWBHeaderData():
        return database.executeUpdateEWBHeaderQuery()
    
    def executeUpdateEWBClearTaxEWBapi(updateEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn)
    
    def preparedUpdateEWbPayload(row):
        gstIn = row[1]
        ewbNumber = row[0]
        documentNo = row[9]
        updateEWBpayload = {
            "EwbNumber": row[0],
            "FromPlace": row[2],
            "FromState": row[3],
            "ReasonCode": row[4],
            "ReasonRemark": row[5],
            "TransDocNo": row[6],
            "TransDocDt": row[7],
            "TransMode": row[8],
            "DocumentNumber": row[9],
            "DocumentType": row[10],
            "DocumentDate": row[11],
            "VehicleType": row[12],
            "VehNo": row[13]
        }
        servicelogger_info.info("...Payload for update EWB created...\n")
        return updateEWBpayload, gstIn, ewbNumber, documentNo
    
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
                    pdfFileName = ewbDatamodel.createEWBpdfFile(EwbNo, usergstIn, documentNo, ewbType)
                    database.persistUpdateEWBSuccessResponseInDB(EwbNo, UpdatedDate, ValidUpto, updateEWBpayload, response_data, pdfFileName)

                else:
                    error_details = response_data.get("errors", [])
                    
                    for error in error_details:
                        error_message = error.get("error_message")
                    
                    servicelogger_info.info(f"... Failure Response from ClearTax EWB update {error_message} And \nStatus Code {res_status_code}...\n")
                    database.persistUpdateEWBFailureResponseInDB(error_message, updateEWBpayload, response_data, ewbNo)
                
            else:
                msg_values = [error["error_message"] for error in response_data["errors"]]
                all_msg_values = ", ".join(msg_values)
                servicelogger_info.info(f"... Failure Response from ClearTax EWB update {error_message} And \nStatus code: {res_status_code}...\n")
                database.persistUpdateEWBFailureResponseInDB(all_msg_values, updateEWBpayload, response_data, ewbNo)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response for update EWB :\n ")

    def payloadCreationUpdateEWBNonIRNexceptionFailureResponse(ewbNum, exceptionMessage):
        try:
            status = "FAILURE"
            database.persistExceptionFailureResponseInDBForUpdateEWBpayload(status, ewbNum, exceptionMessage)
        except Exception as e:
            servicelogger_error.exception("Exception Occured in saving the response of Exception message on payoad creation: \n")
