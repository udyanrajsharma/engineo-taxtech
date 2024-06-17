import requests
import json
import decimal
from decimal import Decimal
from dotenv import load_dotenv
import os
import sys
import logging

servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

extDataDir = os.getcwd()
if getattr(sys, "frozen", False):
    extDataDir = sys._MEIPASS
load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

generateEwbToken = os.getenv('generateEwbAuthToken')
cancelEwbToken = os.getenv('cancelEwbAuthToken')
updateEwbToken = os.getenv('updateEwbAuthToken')
genEwbApiUrl = os.getenv("generateEwbApiUrl")
canEwbApiUrl = os.getenv("cancelEwbApiUrl")
updEwbApiUrl = os.getenv("updateEwbApiUrl")

class apiDetails:

    # Generate EWB Clear Tax API endpoint
    def InvokeClearTaxGenerateEWBAPI(payload,gstIn) :
        print("Inside  Clear Tax Generate EWB API")
        # ClearTax Generate EWB API endpoint
        try:
            clear_tax_generateEWBapi_url = genEwbApiUrl
            request_headers = {
                'X-Cleartax-Auth-Token': generateEwbToken,  
                'gstin': gstIn
            }
            response = requests.put(url=clear_tax_generateEWBapi_url, headers=request_headers, json=json.loads(json.dumps(payload, default=decimal_default)))
            # print("\nPayload: ",json.loads(json.dumps(payload, default=decimal_default)))
            response_statusCode = response.status_code
            print("\nResponse Status Code:",response_statusCode)
            servicelogger_info.info("...ClearTax API for generate EWB called")
            return response.json(), response_statusCode
        except Exception as e:
            print("Error Occured in Calling Generate EWB Non IRN API :",e)
            servicelogger_error.exception("...Exception Occured in Calling the ClearTax Generate EWB API for Non-IRN... \n ")
    
    # Cancel EWB Clear Tax endpoint
    def InvokeClearTaxCancelEWB(cancelEWBpayload,gstIn):
        print("Inside  Clear Tax Cancel EWB API")
        #  Clear Tax Cancel EWB API endpoint
        try:
            clearTax_cancelEWB_api_url = canEwbApiUrl
            request_header_cancelEWB = {
            'X-Cleartax-Auth-Token': cancelEwbToken,  
            'gstin': gstIn
            }
            response = requests.post(url=clearTax_cancelEWB_api_url, headers=request_header_cancelEWB, json=json.loads(json.dumps(cancelEWBpayload, default=decimal_default)))
            response_statusCode = response.status_code
            print("Response from Cancel E-Way Bill: ",response.json())
            servicelogger_info.info("...ClearTax API for cancel EWB called")
            return response.json(), response_statusCode
        except Exception as e:
            print("Error Occured in Calling Cancel EWB Non IRN API :",e)
            servicelogger_error.exception("...Exception Occured in Calling the ClearTax Cancel EWB API... \n ")
    
    # Update EWB Clear Tax endpoint
    def InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn):
        print("Inside  Clear Tax Update EWB API")
        try:
            clearTax_updateEWB_api_url = updEwbApiUrl
            request_header_updateEWB = {
            'X-Cleartax-Auth-Token': updateEwbToken,  
            'gstin': gstIn
            }
            response = requests.post(url=clearTax_updateEWB_api_url, headers=request_header_updateEWB, json=json.loads(json.dumps(updateEWBpayload, default=decimal_default)))
            response_statusCode = response.status_code
            print("Response from Update E-Way Bill: ",response.json())
            servicelogger_info.info("...ClearTax API for update EWB called")
            return response.json(), response_statusCode
        except Exception as e:
            print("Error Occured in Calling Generate EWB Non IRN API :",e)
            servicelogger_error.exception("...Exception Occured in Calling the ClearTax Update EWB API... \n ")



