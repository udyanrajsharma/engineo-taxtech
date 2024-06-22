from domain.einvDataModel import einvDataModel
import logging

servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

class IRISeinv:

    # IRIS E-Inv
    def einvoice_v(from_date, to_date, trx_no, gstin_state, created_by, request_id, customer_Gstin, einv_template):
        try:
            servicelogger_info.info(f"E-Invoice program Called with \nFrom_date: {from_date}\nTo_date: {to_date}\nTransaction_No: {trx_no}\nGSTIN_State: {gstin_state}\nRequest_Id: {request_id}\nCustomer_GSTIN: {customer_Gstin}\nE-Invoice_template: {einv_template}")
            Header_Einv_Prj_data = einvDataModel.getEinvHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin)
            Header_Einv_ST_data = einvDataModel.getEinvStockTransferHeaderData(from_date, to_date, trx_no, gstin_state, customer_Gstin)
            # response_login = einvDataModel.executeIRISLoginAPI()

            if not Header_Einv_Prj_data and not Header_Einv_ST_data:
                servicelogger_info.info(f"No Records found from database for this request id {request_id}")
                # print(f"No Records found for this request id {request_id}")
            else:
                servicelogger_info.info(f"Records found from database for E-Invoice Generation for this request id {request_id}")
                response_login = einvDataModel.executeIRISLoginAPI()

            for row in Header_Einv_Prj_data :
                servicelogger_info.info(f"Program run for a Single Invoice : {row[0]}")
                # print("Inside Loop for a single invoice")
                # print("Login Auth :", response_login)
                res_log1 = einvDataModel.testInvoiceGenerated(from_date, to_date, trx_no)
                # print("Response From Log : ",res_log1)
                if res_log1 != 'SUCCESS':
                    
                    response_payload = einvDataModel.createEinvoicePrjPayload(row)
                    einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3], created_by, request_id)
                    response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
                    einvDataModel.finishEinvoicingProcess(response_einv[0],response_einv[1],response_payload[1],response_payload[2],response_login[0],response_login[1], request_id, einv_template)
                    servicelogger_info.info(f"E-Invoice generated for invoice No {row[0]}")
                else:
                    servicelogger_info.info(f"This E-Invoice No {row[0]} is already generated successfully")
                    einvDataModel.initiateGeneratedEinvoiceProcess(row[0],row[9], created_by, request_id)
          
            for row in Header_Einv_ST_data:
                servicelogger_info.info(f"Program run for a Stock Transfer Single Invoice : {row[0]}")
                res_log2 = einvDataModel.testInvoiceGenerated(from_date, to_date, trx_no)
                # print("res_log : ",res_log2)
                if res_log2 != 'SUCCESS':          
                    response_payload = einvDataModel.createEinvoiceStockTransferPayload(row)
                    einvDataModel.initiateEinvoicingProcess(response_payload[0],response_payload[1],response_payload[3], created_by, request_id)
                    response_einv = einvDataModel.performEinvoicing(response_payload[0],response_payload[2],response_login[0],response_login[1])
                    einvDataModel.finishEinvoicingStockTransferProcess(response_einv[0],response_einv[1],response_payload[1],response_payload[2],response_login[0],response_login[1], request_id, einv_template)
                    servicelogger_info.info(f"E-Invoice generated for a Stock Transfer invoice No {row[0]}")
                else:
                    servicelogger_info.info(f"This Stock Transfer E-Invoice No {row[0]} is already generated successfully")
                    einvDataModel.initiateGeneratedEinvoiceProcess(row[0],row[9], created_by, request_id)
        except Exception as e:
            servicelogger_error.exception("Error Occured in E-Invoice Generation")

    def cancelIRN(cancel_reason, cancel_remark, invoice_id, created_by, request_id):
        try:
            print("Inside Cancel IRN method")
            servicelogger_info.info(f"Program run for Invoice No {invoice_id} and request Id: {request_id}")
            irn_request = einvDataModel.getCancelirnQuery(invoice_id)
            if not irn_request:
                servicelogger_info.info(f"No records found for Cancelllation of Invoice for Request Id : {request_id}")
                print(f"No records found for Cancelllation of Invoice for Request Id : {request_id}")
            else:
                servicelogger_info.info(f"Records found from database for Invoice cancellation for this request id {request_id}")
                response_login = einvDataModel.executeIRISLoginAPI()

            # response_login = einvDataModel.executeIRISLoginAPI()
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
                servicelogger_info.info(f"E-Invoice Cancellation process completed for Invoice No: {invoice_id}")
        except Exception as e:
            print("Error Occured in E-Invoice Cancellation: ",e)
            servicelogger_error.exception(f"Exception Occured in E-Invoice Cancellation for Invoice No: {invoice_id} and request Id: {request_id}")

    def generateEwbNonIrn(doc_number, created_by, request_id):
        try:
            Header_ewb_data = einvDataModel.getEwbHeaderData(doc_number)
            if not Header_ewb_data:
                servicelogger_info.info(f"No records found for EWB Generation for Document No: {doc_number}")
            else:
                servicelogger_info.info(f"Records found from database for EWB Generation for Document No:{doc_number}")
                response_login = einvDataModel.executeIRISTopazLoginAPI()
            # print("Header Data: ",Header_ewb_data)
            for rows in Header_ewb_data:
                print("Inside Loop for a single EWB")
                res_payload = einvDataModel.ewbNonIRNpayload(rows)
                print("EWB Payload: ",res_payload)
                einvDataModel.initiateEwbProcess(res_payload, doc_number, created_by, request_id)
                response_Ewb = einvDataModel.performEwbnonIrn(response_login[1], response_login[0], res_payload)
                einvDataModel.finishEwbNonIrnProcess(response_Ewb[0], response_Ewb[1], doc_number, response_login[1], response_login[0], request_id)
                servicelogger_info.info(f"E-Way Bill generated successfully for Document No: {doc_number}")
        except Exception as e:
            servicelogger_error.exception(f"Exception Occured in E-Way Bill Generation for Document Number: {doc_number}")   