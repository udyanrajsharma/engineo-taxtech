import requests
import json
import decimal
from decimal import Decimal

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

class apiDetails:

    # IRIR Login API
    def InvokeIRISLoginAPI():
        IRIS_login_api_url = "https://api.irisgst.com/irisgst/mgmt/login"
        request_headers_login = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload ={
            "email": "sapphire@gmail.com",
            "password": "Abcd@12345"
        }
        response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
        response = response1.json()
        companyid = response.get('response',{}).get('companyid','')
        token = response.get('response',{}).get('token','')
        return token,companyid
      
    # IRIS GSTR1 API
    def InvokeIRIS_GSTR1_API(payload,gstIn,token,companyid):
        IRIS_GSTR1_api_url = "https://api.irisgst.com/irisgst/sapphire/gstr/addInvoices/regularInvoices?ct=INVOICE&gstin={}".format(gstIn)
        request_headers_gst = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'SAPPHIRE',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        # print("Paylod in IRIS API: \n",json.loads(json.dumps(payload, default=decimal_default)))
        response = requests.post(
            url=IRIS_GSTR1_api_url, 
            headers=request_headers_gst, 
            json=json.loads(json.dumps(payload, default=decimal_default))
            )
        res_status_code = response.status_code
        print(response.json())
        return response,res_status_code
    
    # IRIS GSTR2 API
    def InvokeIRIS_GSTR2_API(payload,gstIn,token,companyid):
        IRIS_GSTR2_api_url = "https://api.irisgst.com/irisgst/sapphire/gstr/addInvoices/GSTR2RiandCdnInvoices?gstin={}".format(gstIn)
        request_headers_gst = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'SAPPHIRE',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        # print("Paylod in IRIS API: \n",json.loads(json.dumps(payload, default=decimal_default)))
        response = requests.post(
            url=IRIS_GSTR2_api_url, 
            headers=request_headers_gst, 
            json=json.loads(json.dumps(payload, default=decimal_default))
            )
        res_status_code = response.status_code
        print(response.json())
        return response,res_status_code
    
    # IRIS E-INVOICE API
    def InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid):
        IRIS_EINV_api_url = "https://api.irisgst.com/irisgst/sapphire/gstr/addInvoices/regularInvoices?ct=INVOICE&gstin={}".format(gstIn)
        request_headers_gst = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'SAPPHIRE',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        # print("Paylod in IRIS API: \n",json.loads(json.dumps(payload, default=decimal_default)))
        response = requests.post(
            url=IRIS_EINV_api_url, 
            headers=request_headers_gst, 
            json=json.loads(json.dumps(payload, default=decimal_default))
            )
        res_status_code = response.status_code
        print(response.json())
        return response,res_status_code

    