from domain.einvDataModel import einvDataModel

class IRISeinv:

    # IRIS E-Inv
    def einvoice_v(from_date, to_date, created_by, request_id):
        print("Inside E-Invoicing Class\n")
        Header_Eibv_data = einvDataModel.getEinvHeaderData(from_date, to_date)
        response_login = einvDataModel.executeIRISLoginAPI()
        for row in Header_Eibv_data:
            print()
            response_payload = einvDataModel.createEinvoicePayload(row)
            einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3],response_payload[4], created_by, request_id)
            response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
            einvDataModel.finishEinvoicingProcess(response_einv[0],response_einv[1],response_payload[1])
            print("E-Invoice Completed for a invoice")