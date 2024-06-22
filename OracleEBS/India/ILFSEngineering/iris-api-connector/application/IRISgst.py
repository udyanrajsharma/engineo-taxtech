from domain.gstDataModel import gstDataModel
import logging

servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

class IRISgst:
     
    # IRIS GSTR1
    def gstr1_v(from_date, to_date, created_by, request_id):
        try:
            print("Inside GSTR1 Model Class\n")
            Header_Gstr1_data = gstDataModel.getGstr1HeaderData(from_date, to_date)
            if not Header_Gstr1_data:
                servicelogger_info.info(f"No Records found for GSTR1 from database for this request id {request_id}")
                # print(f"No Records found from database for this request id {request_id}")
            else:
                servicelogger_info.info(f"Records found for GSTR1 from database for this request id {request_id}")
                # print(f"Records found from database for this request id {request_id}")
                response_login = gstDataModel.executeIRISLoginAPI()

            for row in Header_Gstr1_data:
                response_payload = gstDataModel.createGstr1Paylod(row)
                gstDataModel.initiateGstr1FilingForInvoice(response_payload[0],response_payload[1],response_payload[3],response_payload[4], created_by, request_id)
                response_gstr1 = gstDataModel.fileGSTR1Data(response_payload[0],response_payload[2],response_login[0],response_login[1])
                gstDataModel.finishGstr1FilingForInvoice(response_gstr1[0],response_gstr1[1],response_payload[1], request_id)
               
        except Exception as e:
            servicelogger_error.exception(f"Exception Occured during process the GSTR1 request for request Id : {request_id}")
            # print("Error Occured in GSTR1 Generation: ",e)

    # IRIS GSTR2
    def gstr2_v(from_date, to_date, created_by, request_id):
        try:
            # print("Inside GSTR2 Model Class\n")
            Header_Gstr2_data = gstDataModel.getGstr2HeaderData(from_date, to_date)
            if not Header_Gstr2_data:
                servicelogger_info.info(f"No Records found for GSTR2 from database for this request id {request_id}")
                # print(f"No Records found from database for this request id {request_id}")
            else:
                servicelogger_info.info(f"Records found for GSTR2 from database for this request id {request_id}")
                # print(f"Records found from database for this request id {request_id}")
                response_login = gstDataModel.executeIRISLoginAPI()

            for row in Header_Gstr2_data:
                response_payload = gstDataModel.createGstr2Paylod(row)
                gstDataModel.initiateGstr2FilingForInvoice(response_payload[0],response_payload[1],response_payload[3],response_payload[4], created_by, request_id)
                response_gstr1 = gstDataModel.fileGSTR2Data(response_payload[0],response_payload[2],response_login[0],response_login[1])
                gstDataModel.finishGstr2FilingForInvoice(response_gstr1[0],response_gstr1[1],response_payload[1], request_id)
                # print("Gstr2 Completed for a invoice")
        except Exception as e:
            # print("Error Occured in GSTR2 Generation: ",e)
            servicelogger_error.exception(f"Exception Occured during process the GSTR2 request for request Id : {request_id}")

