from domain.einvDataModel import einvDataModel


class IRISeinv:

    # IRIS E-Inv
    def einvoice_v(from_date, to_date, trx_no, gstin_state, created_by, request_id, customer_Gstin, einv_template):
        print("Inside E-Invoicing Class\n")
        try:
            Header_Einv_Prj_data = einvDataModel.getEinvHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin)
            Header_Einv_ST_data = einvDataModel.getEinvStockTransferHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin)
            # print("Header data of EINV: ",Header_Einv_Prj_data)
            response_login = einvDataModel.executeIRISLoginAPI()

            for row in Header_Einv_Prj_data :
                print("Inside Loop for a single invoice")
                res_log = einvDataModel.testInvoiceGenerated(from_date, to_date, trx_no)
                print("res_log : ",res_log)
                if res_log != 'SUCCESS':
                    print("Call E-Inv API for failure Response")
                    response_payload = einvDataModel.createEinvoicePrjPayload(row)
                    einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3], created_by, request_id)
                    response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
                    einvDataModel.finishEinvoicingProcess(response_einv[0],response_einv[1],response_payload[1],response_payload[2],response_login[0],response_login[1], request_id, einv_template)
                    print("E-Invoice Completed for a Prj invoice")
                else:
                    print("Does not Call E-Inv API for already generated Invoice")
                    einvDataModel.initiateGeneratedEinvoiceProcess(row[0],row[9], created_by, request_id)
          
            for row in Header_Einv_ST_data:
                print("Inside Loop for a single invoice of Stock Transfer")
                res_log = einvDataModel.testInvoiceGenerated(from_date, to_date, trx_no)
                print("res_log : ",res_log)
                if res_log != 'SUCCESS':
                    print("Call E-Inv API for failure Response")
                    response_payload = einvDataModel.createEinvoiceStockTransferPayload(row)
                    einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3], created_by, request_id)
                    response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
                    einvDataModel.finishEinvoicingStockTransferProcess(response_einv[0],response_einv[1],response_payload[1],response_payload[2],response_login[0],response_login[1], request_id, einv_template)
                    print("E-Invoice Completed for a Stock Transfer invoice")
                else:
                    print("Does not Call E-Inv API for already generated Stock Transfer Invoice")
                    einvDataModel.initiateGeneratedEinvoiceProcess(row[0],row[9], created_by, request_id)

        except Exception as e:
            print("Error Occured in E-Invoice Generation: ",e)

    def cancelIRN(cancel_reason, cancel_remark, invoice_id, created_by, request_id):
        try:
            print("Inside Cancel IRN method")
            irn_request = einvDataModel.getCancelirnQuery(invoice_id)
            response_login = einvDataModel.executeIRISLoginAPI()
            print(irn_request)
            # usergstIn = "24AAACI9260R002"
            for irn_data in irn_request:
                print("IRIS_ID = ", irn_data[4])
                if irn_data[3] != None:
                    # Cancel EWB Payload
                    print("EWB Cancellation")
                    ewb_payload = einvDataModel.cancelEWBpayload(irn_data[3],irn_data[1])
                    einvDataModel.performCancelEwb(response_login[1],response_login[0],ewb_payload)
                #  Cancel IRN Payload
                response = einvDataModel.cancelIRNpayload(irn_data[0], irn_data[1], cancel_reason, cancel_remark)          
                einvDataModel.iniateCancelIrnProcess(response, invoice_id, irn_data[2], created_by, request_id)
                # Invoke Cancel IRN API 
                response_cancelIrn = einvDataModel.performCancelIrn(response_login[1],response_login[0],response)
                einvDataModel.finishCancelIrnProcess(response_cancelIrn[0], response_cancelIrn[1], invoice_id, request_id, irn_data[4], response_login[1],response_login[0])
        except Exception as e:
            print("Error Occured in E-Invoice Cancellation: ",e)

    def generateEwbNonIrn(doc_number, created_by, request_id):
        try:
            print("Inside Non-IRN EWB")
            print("CreatedBy :",created_by,"\nRequestId:",request_id)
            Header_ewb_data = einvDataModel.getEwbHeaderData(doc_number)
            response_login = einvDataModel.executeIRISTopazLoginAPI()
            # print("Header Data: ",Header_ewb_data)
            for rows in Header_ewb_data:
                print("Inside Loop for a single EWB")
                res_payload = einvDataModel.ewbNonIRNpayload(rows)
                print("EWB Payload: ",res_payload)
                einvDataModel.initiateEwbProcess(res_payload, doc_number, created_by, request_id)
                response_Ewb = einvDataModel.performEwbnonIrn(response_login[1], response_login[0], res_payload)
                einvDataModel.finishEwbNonIrnProcess(response_Ewb[0], response_Ewb[1], doc_number, response_login[1], response_login[0], request_id)
        except Exception as e:
            print("Error Occured in E-Way Bill Generation: ",e)      