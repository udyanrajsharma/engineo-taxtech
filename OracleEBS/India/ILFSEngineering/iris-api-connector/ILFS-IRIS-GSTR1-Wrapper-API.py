
from flask import Flask, request, jsonify 
import requests
import json
from decimal import Decimal
import os
import sys
import logging
import logging.handlers

app = Flask(__name__) 

login_email = "sapphire@gmail.com"
login_password = "Abcd@12345"

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

current_dir = os.path.dirname(sys.executable)

log_dir = os.path.join(current_dir,"LOGS_GSTR1")
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file_info = os.path.join(log_dir,f"IRIS_ILFS_GSTR1_INFO.log")
log_file_error = os.path.join(log_dir, f"IRIS_ILFS_GSTR1_ERROR.log")

# Return a logger with the specified name.
servicelogger_info = logging.getLogger("IRISgstr1InfoLogger")
servicelogger_error = logging.getLogger("IRISgstr1ErrorLogger")

# Sets the threshold for this logger to lvl. Logging messages which are less severe than lvl will be ignored.
level = logging.DEBUG
servicelogger_info.setLevel(logging.DEBUG)
servicelogger_error.setLevel(logging.DEBUG)

handler_info = logging.handlers.TimedRotatingFileHandler(
    log_file_info, when='midnight', interval=1, backupCount=10
)
handler_info.suffix = "%d%m%Y" 
handler_info.setLevel(level)

handler_error = logging.handlers.TimedRotatingFileHandler(
    log_file_error, when='midnight', interval=1, backupCount=10
)
handler_error.suffix = "%d%m%Y" 
handler_error.setLevel(level)

# Sets format of record in log file
formatter = logging.Formatter(
    "%(asctime)s - %(module)-10s - %(levelname)-8s %(message)s", "%d-%m-%Y %H:%M:%S"
)
handler_info.setFormatter(formatter)
handler_error.setFormatter(formatter)

# Adds the specified handler to logger 
servicelogger_info.addHandler(handler_info)
servicelogger_error.addHandler(handler_error)

@app.route('/iris/ilfs/gstr1/wrapper/api/', methods = ['POST']) 
def irisGstr1Wrapper():
    try:
        #IRIS Login Auth Token API    
        irisLoginAuthTokenUrl = 'https://api.irisgst.com/irisgst/mgmt/login'
        irisLoginAuthTokenHeader = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
        payload ={
                "email": login_email,
                "password": login_password
            }
        IrisAuthApiResponse = requests.post(url= irisLoginAuthTokenUrl, headers=irisLoginAuthTokenHeader, json=json.loads(json.dumps(payload)))
        response = IrisAuthApiResponse.json()
        companyid = response.get('response',{}).get('companyid','')
        token = response.get('response',{}).get('token','')
        servicelogger_info.info("IRIS GSTR1 Auth Token API executed")

        # IRIS GSTR1 API
        data = request.get_json()
        gstIn = data.get("userGstIn", "")
        gstr1Payload = data.get("payload", "")

        IRIS_GSTR1_api_url = "https://api.irisgst.com/irisgst/sapphire/gstr/addInvoices/regularInvoices?ct=INVOICE&gstin={}".format(gstIn)
        request_headers_gst = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'SAPPHIRE',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        
        IrisGstr1Apiresponse = requests.post(
            url=IRIS_GSTR1_api_url, 
            headers=request_headers_gst, 
            json=json.loads(json.dumps(gstr1Payload, default=decimal_default))
        )

        Gstr1JsonResponse = IrisGstr1Apiresponse.json()
        # print("IRIS GSTR1 API executed")
        servicelogger_info.info("IRIS GSTR1 API executed")

        return Gstr1JsonResponse
    except Exception as e:
        servicelogger_error.exception("Exception Occured in Calling GSTR1 Wrapper API")
        message = f"Exception Occured on calling GSTR1 Wrapper API : {e}"
        # print(message)
        return jsonify({"result": "error", "message": str(e)})

if __name__ == '__main__': 
    APP_PORT = 6110
    app.run(debug = True, port=APP_PORT,host='0.0.0.0')
