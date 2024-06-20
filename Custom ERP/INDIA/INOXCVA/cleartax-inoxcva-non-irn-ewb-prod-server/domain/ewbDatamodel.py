from infrastructure.database import database
from infrastructure.apiDetails import apiDetails
import logging

servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")

class ewbDatamodel:

    # Generate E-Way Bill
    def getHeaderData():
        return database.executeHeaderDBQuery()

    def getLineItemData(document_No):
        return database.executeLineDBQuery(document_No)
    
    def executeClearTaxEWBapi(payload,gstIn):
        return apiDetails.InvokeClearTaxGenerateEWBAPI(payload,gstIn)

    def saveResponse(response_data, res_status_code, payload):
        try:
            DocumentNumber = response_data.get('ewb_request', {}).get("DocumentNumber", '')
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                Gstin_s = response_data.get('ewb_request', {}).get('SellerDtls', {}).get("Gstin", '')
                
                Success = response_data.get('govt_response', {}).get("Success", '')
                transaction_id = response_data.get("transaction_id", '')
                TotalInvoiceAmount = response_data.get('ewb_request', {}).get("TotalInvoiceAmount", '')
                if Success == "Y":
                    print("Inside Success: ",Success)
                    Status = response_data.get('govt_response', {}).get("Status", '')
                    EwbNo = response_data.get('govt_response', {}).get("EwbNo", '')
                    EwbDt = response_data.get('govt_response', {}).get("EwbDt", '')
                    EwbValidTill = response_data.get('govt_response', {}).get("EwbValidTill", '')
                    Alert = response_data.get('govt_response', {}).get("Alert", '')
                    print(Status,EwbNo,EwbDt,EwbValidTill)
                    servicelogger_info.info("... Success Response from ClearTax EWB generation...\n")
                    database.persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill,DocumentNumber, payload, response_data)

                elif Success == "N" :
                    print("Inside Success: ",Success)
                    error_details = response_data.get("govt_response", {}).get("ErrorDetails", [])
                    fail_status = "FAILURE"
                    for error in error_details:
                        error_code = error.get("error_code")
                        error_message = error.get("error_message")
                        error_source = error.get("error_source")
                    print(fail_status,error_message)
                    servicelogger_info.info("... Failure Response from ClearTax EWB generation...\n")
                    database.persistFailureResponseInDB(fail_status,error_message, error_code, error_source, DocumentNumber, payload, response_data)

                # print("Data from response saved successfully.",response_data)
                print(f"Response from API on 200 status: \n Success : {Success} \n Gstin : {Gstin_s} \n Total Invoice Amount : {TotalInvoiceAmount}")
                
            else:  
                fail_status = "FAILURE"
                errorSource = response_data.get("error_source", '')
                errorCode = response_data.get("error_code", '')
                errorMessage = response_data.get("error_message", '')
                servicelogger_info.info("... Failure Response from ClearTax EWB generation...\n")
                database.persistFailureResponseInDB(fail_status, errorMessage, errorCode, errorSource, DocumentNumber, payload, response_data)
                print("Response from Clear Tax API on failure: {} \nError: Failed to make API call to ClearTax API.".format(response_data))

        except Exception as e:
            print("Error in data model for EWB generation: ",e)
            servicelogger_error.exception("Exception Occured in saving the response for generate EWB :\n ")

    # Cancel E-Way Bill
    def getCancelEWBHeaderData():
        return database.executeCancelEWBHeaderQuery()
    
    def executeCancelEWBClearTaxEWBapi(cancelEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxCancelEWB(cancelEWBpayload, gstIn)
    
    def cancelEWBsaveResponse(response_data, res_status_code, cancelEWBpayload, ewbNo):
        try:
            print("Cancel Save Response")
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                gstin = response_data.get("gstin", '')
                irn = response_data.get("irn", '')
                ewbNumber = response_data.get("ewbNumber", '')
                ewbStatus = response_data.get("ewbStatus", '')
                errorDetails = response_data.get("errorDetails", '')
                servicelogger_info.info("... Success Response from ClearTax EWB cancellation...\n")
                if errorDetails == None:
                    print("Inside Success: ")
                    database.persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus, cancelEWBpayload, response_data)

                else :
                    error_message = response_data.get("errorDetails", {}).get("error_message", '')
                    fail_status = "FAILURE"
                    print(fail_status,error_message)
                    servicelogger_info.info("... Failure Response from ClearTax EWB cancellation...\n")
                    database.persistCancelEWBFailureResponseInDB(fail_status,error_message, cancelEWBpayload, response_data, ewbNo)
                # print("Data from response saved successfully.",response_data)
                print(f"Response from API on 200 status: \n Success")
                
            else:
                fail_status = "FAILURE"
                error_message = response_data.get("error_message", '')
                servicelogger_info.info("... Failure Response from ClearTax EWB cancellation...\n")
                database.persistCancelEWBFailureResponseInDB(fail_status,error_message, cancelEWBpayload, response_data, ewbNo)
                print("Response from Clear Tax API on failure: \nError: Failed to make API call to ClearTax API.".format(response_data))
        
        except Exception as e:
            print("Error Occured in Save Response of Cancel EWB: ",e)
            servicelogger_error.exception("Exception Occured in saving the response for cancel EWB :\n ")

    # Update E-Way Bill
    def getUpdateEWBHeaderData():
        return database.executeUpdateEWBHeaderQuery()
    
    def executeUpdateEWBClearTaxEWBapi(updateEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn)
    
    def saveResponseUpdateEWB(response_data, res_status_code, updateEWBpayload, ewbNo):
        try:
            print("Inside Save Response of EWB Update")
            if res_status_code == 200:
                # Extract relevant fields from the response and save them to another table in MSSQL
                errors = response_data.get("errors", '')
                if errors == None:
                    print("Inside Success: ")
                    EwbNo = response_data.get("EwbNumber", '')
                    UpdatedDate = response_data.get("UpdatedDate", '')
                    ValidUpto = response_data.get("ValidUpto", '')
                    print("Success response Update EWB called")
                    servicelogger_info.info("... Success Response from ClearTax EWB update...\n")
                    database.persistUpdateEWBSuccessResponseInDB(EwbNo, UpdatedDate, ValidUpto, updateEWBpayload, response_data)

                else:
                    print("Inside failure for 200")
                    error_details = response_data.get("errors", [])
                    
                    for error in error_details:
                        error_code = error.get("error_code")
                        error_message = error.get("error_message")
                        error_source = error.get("error_source")
                    print(error_message)
                    fail_status = "FAILURE"
                    print(fail_status,error_message)
                    print("Fail response Update EWB called")
                    servicelogger_info.info("... Failure Response from ClearTax EWB update...\n")
                    database.persistUpdateEWBFailureResponseInDB(error_message, updateEWBpayload, response_data, ewbNo)

                # print("Data from response saved successfully.",response_data)
                print(f"Response from API on 200 status: \n Success")
                
            else:
                print("Inside rest 200 status code in failure")
                msg_values = [error["error_message"] for error in response_data["errors"]]
                all_msg_values = ", ".join(msg_values)
                print("All Messages: ",all_msg_values)
                servicelogger_info.info("... Failure Response from ClearTax EWB update...\n")
                database.persistUpdateEWBFailureResponseInDB(all_msg_values, updateEWBpayload, response_data, ewbNo)
                print("Response from Clear Tax API on failure: {} \nError: Failed to make API call to ClearTax API.".format(response_data))
        except Exception as e:
            print("Error Occured in Save Response of Upadte EWB: ",e)
            servicelogger_error.exception("Exception Occured in saving the response for update EWB :\n ")
