import requests
import json
import decimal
from decimal import Decimal
from dotenv import load_dotenv
import os
import configparser
import base64
import sys
import logging

config = configparser.ConfigParser()
extDataDir = os.getcwd()
config_path = extDataDir+'/property2.ini'
config.read(config_path)

def decode_value(encoded_str):
    decoded_bytes = base64.b64decode(encoded_str.encode('utf-8'))
    decoded_str = decoded_bytes.decode('utf-8')
    return decoded_str

generateEwbToken = decode_value(config.get('API_DETAILS', 'generateEwbAuthToken'))
cancelEwbToken = decode_value(config.get('API_DETAILS', 'cancelEwbAuthToken'))
updateEwbToken = decode_value(config.get('API_DETAILS', 'updateEwbAuthToken'))
genEwbApiUrl = decode_value(config.get('API_DETAILS', 'generateEwbApiUrl'))
canEwbApiUrl = decode_value(config.get('API_DETAILS', 'cancelEwbApiUrl'))
updEwbApiUrl = decode_value(config.get('API_DETAILS', 'updateEwbApiUrl'))

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

extDataDir = os.getcwd()
if getattr(sys, "frozen", False):
    extDataDir = sys._MEIPASS
load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

# generateEwbToken = os.getenv('generateEwbAuthToken')
# cancelEwbToken = os.getenv('cancelEwbAuthToken')
# updateEwbToken = os.getenv('updateEwbAuthToken')
# genEwbApiUrl = os.getenv("generateEwbApiUrl")
# canEwbApiUrl = os.getenv("cancelEwbApiUrl")
# updEwbApiUrl = os.getenv("updateEwbApiUrl")

info_logger = logging.getLogger('info_logger')
error_logger = logging.getLogger('error_logger')

class apiDetails:

    # Generate EWB Clear Tax API endpoint
    def InvokeClearTaxGenerateEWBAPI(payload,gstIn) :
        print("Inside  Clear Tax Generate EWB API")
        info_logger.info("Inside  Clear Tax Generate EWB API")
        # ClearTax Generate EWB API endpoint
        clear_tax_generateEWBapi_url = genEwbApiUrl
        request_headers = {
            'X-Cleartax-Auth-Token': generateEwbToken,  
            'gstin': gstIn
        }
        response = requests.put(url=clear_tax_generateEWBapi_url, headers=request_headers, json=json.loads(json.dumps(payload, default=decimal_default)))
        print("\nPayload: ",json.loads(json.dumps(payload, default=decimal_default)))
        response_statusCode = response.status_code
        print("\nResponse Status Code:",response_statusCode)
        return response.json(), response_statusCode
    
    # Cancel EWB Clear Tax endpoint
    def InvokeClearTaxCancelEWB(cancelEWBpayload,gstIn):
        print("Inside  Clear Tax Cancel EWB API")
        #  Clear Tax Cancel EWB API endpoint
        clearTax_cancelEWB_api_url = canEwbApiUrl
        request_header_cancelEWB = {
        'X-Cleartax-Auth-Token': cancelEwbToken,  
        'gstin': gstIn
        }
        response = requests.post(url=clearTax_cancelEWB_api_url, headers=request_header_cancelEWB, json=json.loads(json.dumps(cancelEWBpayload, default=decimal_default)))
        response_statusCode = response.status_code
        print("Response from Cancel E-Way Bill: ",response.json())
        return response.json(), response_statusCode
    
    # Update EWB Clear Tax endpoint
    def InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn):
        print("Inside  Clear Tax Update EWB API")
        clearTax_updateEWB_api_url = updEwbApiUrl
        request_header_updateEWB = {
        'X-Cleartax-Auth-Token': updateEwbToken,  
        'gstin': gstIn
        }
        response = requests.post(url=clearTax_updateEWB_api_url, headers=request_header_updateEWB, json=json.loads(json.dumps(updateEWBpayload, default=decimal_default)))
        response_statusCode = response.status_code
        print("Response from Update E-Way Bill: ",response.json())
        return response.json(), response_statusCode



