from infrastructure.database import database
from infrastructure.apiDetails import apiDetails

class einvDataModel:

    def executeIRISLoginAPI():
        return apiDetails.InvokeIRISLoginAPI()

    # E-INVOICE
    def getEinvHeaderData():
        return database.executeEinvHeaderQuery()
    
    def getEinvLineItemData(document_No):
        return database.executeEinvHeaderQuery(document_No)
    
    def initiateGstr2FilingForInvoice(payload,invoice_id,invoice_date,return_period):
        return database.persistInsertEinvRequestInDB(payload,invoice_id,invoice_date,return_period)

    def fileEinvData(payload,gstIn,token,companyid):
        return apiDetails.InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid)
    
    def finishEinvFilingForInvoice(response,res_status_code,invoice_id):
        return database.persistUpdateEinvResponseInDB(response,res_status_code,invoice_id)