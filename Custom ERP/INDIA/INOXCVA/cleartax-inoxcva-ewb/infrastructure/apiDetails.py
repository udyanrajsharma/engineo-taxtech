import requests
import json
import decimal
from decimal import Decimal

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

class apiDetails:

    # Generate EWB Clear Tax API endpoint
    def InvokeClearTaxGenerateEWBAPI(payload,gstIn) :
        print("Inside  Clear Tax Generate EWB API")
        # ClearTax Generate EWB API endpoint
        clear_tax_generateEWBapi_url = "https://api-sandbox.clear.in/einv/v3/ewaybill/generate"
        request_headers = {
            'X-Cleartax-Auth-Token': '1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272',  
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
        clearTax_cancelEWB_api_url = "https://api-sandbox.clear.in/einv/v2/eInvoice/ewaybill/cancel"
        request_header_cancelEWB = {
        'X-Cleartax-Auth-Token': '1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272',  
        'gstin': gstIn
        }
        response = requests.post(url=clearTax_cancelEWB_api_url, headers=request_header_cancelEWB, json=json.loads(json.dumps(cancelEWBpayload, default=decimal_default)))
        response_statusCode = response.status_code
        print("Response from Cancel E-Way Bill: ",response.json())
        return response.json(), response_statusCode
    
    # Update EWB Clear Tax endpoint
    def InvokeClearTaxUpdateEWB(updateEWBpayload,gstIn):
        print("Inside  Clear Tax Update EWB API")
        clearTax_updateEWB_api_url = "https://api-sandbox.clear.in/einv/v1/ewaybill/update?action=PARTB"
        request_header_updateEWB = {
        'X-Cleartax-Auth-Token': '1.d73855b2-f45b-4965-b232-c22246866959_7802e81d991e684d3ab1ec496737230325f2d9e409c7f7101f4b8441c3fc4272',  
        'gstin': gstIn
        }
        response = requests.post(url=clearTax_updateEWB_api_url, headers=request_header_updateEWB, json=json.loads(json.dumps(updateEWBpayload, default=decimal_default)))
        response_statusCode = response.status_code
        print("Response from Update E-Way Bill: ",response.json())
        return response.json(), response_statusCode



