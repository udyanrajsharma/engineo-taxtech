from flask import Flask, request, jsonify
from datetime import datetime
import requests
import json
from application.IRISgst import IRISgst
from application.IRISeinv import IRISeinv
import threading
import time
import logging

servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

app = Flask(__name__)

@app.route("/ilfs/gstr1/", methods=["POST"])
def api_gstr1():
    try:
        
        data = request.get_json()
        from_date = data.get("From_date", "")
        to_date = data.get("To_Date", "")
        created_by = data.get("Created_By", "")
        request_id = data.get("Request_Id", "")

        def long_running_task():
            servicelogger_info.info(f"\n..............GSTR1 program called for  request_id: {request_id }..............\n")
            IRISgst.gstr1_v(from_date, to_date, created_by, request_id)
            servicelogger_info.info(f"\n...............GSTR1 request processed successfully for request_id: {request_id }.............\n")
            servicelogger_info.info("\n\n------------------------------------------------------------------------------------------------------------------------------------------\n\n")

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = (
            "GSTR1 API called successfully AND From date : {} AND To date : {}".format(
                from_date, to_date
            )
        )
        return jsonify(message), 200

    except Exception as e:
        servicelogger_error.exception("Exception Occured to call the GSTR1 concurrent program")
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/gstr2/", methods=["POST"])
def api_gstr2():
    try:
        # servicelogger_info.info("...GSTR2 generation Function Called...\n")
        data = request.get_json()
        # print("API Called")
        from_date = data.get("From_date", "")
        to_date = data.get("To_Date", "")
        created_by = data.get("Created_By", "")
        request_id = data.get("Request_Id", "")

        def long_running_task():
            servicelogger_info.info(f"\n.......GSTR2 program called for  request_id: {request_id }.........\n")
            IRISgst.gstr2_v(from_date, to_date, created_by, request_id)
            servicelogger_info.info(f"\n..........GSTR2 request processed successfully for request_id: {request_id }...........\n")
            servicelogger_info.info("\n\n--------------------------------------------------------------------------------------------------------------------------------------------------------------\n\n")

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = (
            "GSTR2 API called successfully AND From date : {} AND To date : {}".format(
                from_date, to_date
            )
        )
        return jsonify(message), 200

    except Exception as e:
        servicelogger_error.exception("Exception Occured to call the GSTR2 concurrent program")
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/einvoice/", methods=["POST"])
def api_eInvoicing():
    try:
        servicelogger_info.info("...E-Invoice generation Function Called...\n")
        data = request.get_json()
        print("API Called")
        from_date = data.get('From_Date','')
        to_date = data.get('To_Date','')
        trx_no = data.get('TRX_NUMBER','')
        gstin_State = data.get('GSTIN_STATE','')
        created_by = data.get('Created_By','')
        request_id = data.get('Request_Id','')
        customer_Gstin = data.get('CUST_GSTIN','')
        einv_template = data.get('P_EINV_TEMP','')

        def long_running_task():
            servicelogger_info.info(f"\n........E-Invoice generation Program called for  request_id: {request_id }.............\n")
            IRISeinv.einvoice_v(from_date, to_date, trx_no, gstin_State, created_by, request_id, customer_Gstin, einv_template)
            servicelogger_info.info(f"\n......E-Invoice Generation request processed successfully for request_id: {request_id }.........\n")
            servicelogger_info.info("\n\n---------------------------------------------------------------------------------------------------------------------------------------------------------------\n\n")
            # IRISeinv.Test_einvoice_v(from_date, to_date, trx_no, created_by, request_id)

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = "E-invoice API called successfully AND From date : {} AND To date : {} AND Transaction No: {} AND GSTIN State: {} AND Created BY: {} AND Request ID: {}".format(
            from_date, to_date, trx_no, gstin_State, created_by, request_id
        )
        return jsonify(message), 200
    except Exception as e:
        servicelogger_error.exception("Exception Occured during call the E-Invoice generation Concurrent program: ")
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/cancelirn/", methods=["POST"])
def api_cancelIrn():
    try:
        
        data = request.get_json()
        # print("Cancel Reason, Cancel Remark, Invoice Id")
        cancel_reason = data.get("CANCEL_REASON", "")
        cancel_remark = data.get("CANCEL_REMARK", "")
        invoice_id = data.get("INVOICE_ID", "")
        created_by = data.get("Created_By", "")
        request_id = data.get("Request_Id", "")

        servicelogger_info.info(f"\n............E-Invoice cancellation Program called for  request_id: {request_id } and Invoice No: {invoice_id}..............\n")
        IRISeinv.cancelIRN(
            cancel_reason, cancel_remark, invoice_id, created_by, request_id
        )   
        servicelogger_info.info(f"\n............E-Invoice cancellation request processed successfully for request_id: {request_id } and Invoice No :{invoice_id}............\n")
        servicelogger_info.info("\n\n---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------\n\n")
        
        message = "Cancel IRN API called successfully for Invoice ID {}".format(
            invoice_id
        )
        return jsonify(message), 200
    except Exception as e:
        servicelogger_error.exception("Exception Occured during call the E-Invoice cancellation Concurrent program: ")
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/ewb/nonirn/", methods=["POST"])
def api_ewbNonIrn():
    try:
        data = request.get_json()
        doc_number = data.get("P_DOC_NUMBER", "")
        created_by = data.get("Created_By", "")
        request_id = data.get("Request_Id", "")

        def long_running_task():
            servicelogger_info.info(f"\n........E-Way Bill Function program called for  request_id: {request_id} and Document No: {doc_number}.........\n")
            IRISeinv.generateEwbNonIrn(
                doc_number, created_by, request_id
            )
            servicelogger_info.info("\n\n---------------------------------------------------------------------------------------------------------------------------------------------------------------\n\n")

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = "EWB for Non-IRN API called successfully for Documnet No {}".format(
            doc_number
        )
        return jsonify(message), 200
    except Exception as e:
        servicelogger_error.exception("Exception Occured during call the E-Way Bill generation Concurrent program: ")
        return jsonify({"result": "error", "message": str(e)})


if __name__ == '__main__':
   app.run(host='0.0.0.0',port=5500, debug=True)
