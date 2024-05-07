from infrastructure.database import database
from infrastructure.apiDetails import apiDetails

class ewbDatamodel:

    # Generate E-Way Bill
    def getHeaderData():
        return database.executeHeaderDBQuery()

    def getLineItemData(document_No):
        return database.executeLineDBQuery(document_No)
    
    def executeClearTaxEWBapi(payload,gstIn):
        return apiDetails.InvokeClearTaxGenerateEWBAPI(payload,gstIn)

    def saveResponse(response_data, res_status_code):
        if res_status_code == 200:
            # Extract relevant fields from the response and save them to another table in MSSQL
            Gstin_s = response_data.get('ewb_request', {}).get('SellerDtls', {}).get("Gstin", '')
            DocumentNumber = response_data.get('ewb_request', {}).get("DocumentNumber", '')
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
                database.persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill)

            elif Success == "N" :
                print("Inside Success: ",Success)
                error_details = response_data.get("govt_response", {}).get("ErrorDetails", [])
                fail_status = "FAILURE"
                for error in error_details:
                    error_code = error.get("error_code")
                    error_message = error.get("error_message")
                    error_source = error.get("error_source")
                print(fail_status,error_message)
                database.persistFailureResponseInDB(fail_status,error_message)

            # print("Data from response saved successfully.",response_data)
            print(f"Response from API on 200 status: \n Success : {Success} \n Gstin : {Gstin_s} \n Total Invoice Amount : {TotalInvoiceAmount}")
            
        else:
            
            print("Response from Clear Tax API on failure: {} \nError: Failed to make API call to ClearTax API.".format(response_data))


    # Cancel E-Way Bill
    def getCancelEWBHeaderData():
        return database.executeCancelEWBHeaderQuery()
    
    def executeCancelEWBClearTaxEWBapi(cancelEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxCancelEWB(cancelEWBpayload, gstIn)
    
    def cancelEWBsaveResponse(response_data,res_status_code):
        print("Cancel Save Response")
        if res_status_code == 200:
            # Extract relevant fields from the response and save them to another table in MSSQL
            gstin = response_data.get("gstin", '')
            irn = response_data.get("irn", '')
            ewbNumber = response_data.get("ewbNumber", '')
            ewbStatus = response_data.get("ewbStatus", '')
            errorDetails = response_data.get("errorDetails", '')
            if errorDetails == None:
                print("Inside Success: ")
                database.persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus)

            else :
                error_message = response_data.get("errorDetails", {}).get("error_message", '')
                fail_status = "FAILURE"
                print(fail_status,error_message)
                database.persistCancelEWBFailureResponseInDB(gstin,irn,ewbNumber,ewbStatus,error_message )
            # print("Data from response saved successfully.",response_data)
            print(f"Response from API on 200 status: \n Success")
            
        else:
            print("Response from Clear Tax API on failure: \nError: Failed to make API call to ClearTax API.".format(response_data))


    # Update E-Way Bill
    def getUpdateEWBHeaderData():
        return database.executeUpdateEWBHeaderQuery()
    
    def executeUpdateEWBClearTaxEWBapi(updateEWBpayload,gstIn):
        return apiDetails.InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn)
    
    def saveResponseUpdateEWB(response_data,res_status_code):
        print()
        if res_status_code == 200:
            # Extract relevant fields from the response and save them to another table in MSSQL
            errors = response_data.get("errors", '')
            if errors == None:
                print("Inside Success: ")
                EwbNo = response_data.get("EwbNumber", '')
                UpdatedDate = response_data.get("UpdatedDate", '')
                ValidUpto = response_data.get("ValidUpto", '')
                print("Success response Update EWB called")
                database.persistUpdateEWBSuccessResponseInDB(EwbNo,UpdatedDate,ValidUpto)

            else:
                error_message = response_data.get("errors", {}).get("error_message", '')
                fail_status = "FAILURE"
                print(fail_status,error_message)
                print("Fail response Update EWB called")
                database.persistUpdateEWBFailureResponseInDB(error_message )

            # print("Data from response saved successfully.",response_data)
            print(f"Response from API on 200 status: \n Success")
            
        else:
            
            print("Response from Clear Tax API on failure: {} \nError: Failed to make API call to ClearTax API.".format(response_data))
