from domain.einvDataModel import einvDataModel

class IRISeinv:

    # IRIS E-Inv
    def einvoice_v(from_date, to_date, trx_no, created_by, request_id):
        print("Inside E-Invoicing Class\n")
        Header_Eibv_data = einvDataModel.getEinvHeaderData(from_date, to_date, trx_no)
        # print("Header data: ",Header_Eibv_data)
        response_login = einvDataModel.executeIRISLoginAPI()
        for row in Header_Eibv_data:
            print("Inside Loop for a single invoice")
            response_payload = einvDataModel.createEinvoicePayload(row)
            einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3], created_by, request_id)
            response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
            einvDataModel.finishEinvoicingProcess(response_einv[0],response_einv[1],response_payload[1],response_payload[2],response_login[0],response_login[1], request_id)
            print("E-Invoice Completed for a invoice")

    def cancelIRN(cancel_reason, cancel_remark, invoice_id, created_by, request_id):
        print("Inside Cancel IRN method")
        irn_request = einvDataModel.getCancelirnQuery(invoice_id)
        response_login = einvDataModel.executeIRISLoginAPI()
        # print(irn_request)
        for irn_data in irn_request:
            # response = einvDataModel.cancelIRNpayload(irn_data[0], irn_data[1], cancel_reason, cancel_remark)
            usergstIn = "24AAACI9260R002"
            response = einvDataModel.cancelIRNpayload(irn_data[0], usergstIn, cancel_reason, cancel_remark)
            # print("Payload: \n",response)
            response_login = einvDataModel.executeIRISLoginAPI()
            einvDataModel.iniateCancelIrnProcess(response, invoice_id, irn_data[2], created_by, request_id)
            response_cancelIrn = einvDataModel.performCancelIrn(response_login[1],response_login[0],response)
            # print("Cancel IRN Response: \n",response_cancelIrn)
            einvDataModel.finishCancelIrnProcess(response_cancelIrn[0], response_cancelIrn[1], invoice_id)