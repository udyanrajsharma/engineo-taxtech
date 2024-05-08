from flask import Flask, request, jsonify
from datetime import datetime
import requests
import json
from application.IRISgst import IRISgst
from application.IRISeinv import IRISeinv
import threading
import time

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
            IRISgst.gstr1_v(from_date, to_date, created_by, request_id)

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        # IRISgst.gstr1_v(from_date, to_date, created_by, request_id)
        message = (
            "GSTR1 API called successfully AND From date : {} AND To date : {}".format(
                from_date, to_date
            )
        )
        return jsonify(message), 200

    except Exception as e:
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/gstr2/", methods=["POST"])
def api_gstr2():
    try:
        data = request.get_json()
        # print("API Called")
        from_date = data.get("From_date", "")
        to_date = data.get("To_Date", "")
        created_by = data.get("Created_By", "")
        request_id = data.get("Request_Id", "")

        def long_running_task():
            IRISgst.gstr2_v(from_date, to_date, created_by, request_id)

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = (
            "GSTR2 API called successfully AND From date : {} AND To date : {}".format(
                from_date, to_date
            )
        )
        return jsonify(message), 200

    except Exception as e:
        return jsonify({"result": "error", "message": str(e)})


@app.route("/ilfs/einvoice/", methods=["POST"])
def api_eInvoicing():
    try:
        data = request.get_json()
        # print("API Called")
        from_date = data.get('From_date','')
        to_date = data.get('To_Date','')
        trx_no = data.get('P_TRX_NUMBER','')
        created_by = data.get('Created_By','')
        request_id = data.get('Request_Id','')

        def long_running_task():
            IRISeinv.einvoice_v(from_date, to_date, trx_no, created_by, request_id)

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = "E-Invoice API called successfully AND From date : {} AND To date : {}".format(
            from_date, to_date
        )
        return jsonify(message), 200
    except Exception as e:
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

        def long_running_task():
            IRISeinv.cancelIRN(
                cancel_reason, cancel_remark, invoice_id, created_by, request_id
            )

        thread1 = threading.Thread(target=long_running_task)
        thread1.start()

        message = "Cancel IRN API called successfully for Invoice ID {}".format(
            invoice_id
        )
        return jsonify(message), 200
    except Exception as e:
        return jsonify({"result": "error", "message": str(e)})


# if __name__ == '__main__':
#    app.run(host='0.0.0.0',port=5500, debug=True)
