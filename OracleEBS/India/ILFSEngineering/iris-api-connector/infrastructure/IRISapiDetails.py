import requests
import json
import decimal
from decimal import Decimal
from dotenv import load_dotenv
import os
import sys
# import logging

# servicelogger = logging.getLogger("IRISConnectorServiceLogger")

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

# load_dotenv()
extDataDir = os.getcwd()
if getattr(sys, "frozen", False):
    extDataDir = sys._MEIPASS
load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

email = os.getenv("login_email")
password = os.getenv("login_password")
einv_email = os.getenv("login_einv_email")
einv_password = os.getenv("login_einv_password")
ewb_email = os.getenv("login_ewb_email")
ewb_password = os.getenv("login_ewb_password")
oracle_client_dirpath = os.getenv("client_dir_path")

class apiDetails:

    # IRIS GST Login API
    def InvokeIRISLoginAPI():
        IRIS_login_api_url = "https://api.irisgst.com/irisgst/mgmt/login"
        request_headers_login = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload ={
            "email": email,
            "password": password
        }
        try:
            response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
            response = response1.json()
            companyid = response.get('response',{}).get('companyid','')
            # print("Company_ID: ", companyid)
            token = response.get('response',{}).get('token','')
            return token,companyid
        except Exception as e:
            print("Error Occured in Calling GST Login IRIS API :",e)
    
    # IRIS E-INV Login API
    def InvokeIRISEinvLoginAPI():
        IRIS_login_api_url = "https://stage-api.irisgst.com/irisgst/mgmt/login"
        request_headers_login = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload ={
            "email": einv_email,
            "password": einv_password
        }
        try:
            response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
            response = response1.json()
            print("Response from E-Inv Auth Token: \n",response)
            companyid = response.get('response',{}).get('companyid','')
            token = response.get('response',{}).get('token','')
            print("Company_ID: ", companyid, "\nToken: ", token)
            print("Auth Token generated")
            return token,companyid
        except Exception as e:
            print("Error Occured in Calling E-INV Login IRIS API :",e)
      
    # IRIS EWB Login API
    def InvokeIRISEwbLoginAPI():
        IRIS_login_api_url = "https://stage-api.irisgst.com/irisgst/mgmt/login"
        request_headers_login = {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
        payload ={
            "email": ewb_email,
            "password": ewb_password
        }
        try:
            response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
            response = response1.json()
            companyid = response.get('response',{}).get('companyid','')
            print("Company_ID: ", companyid)
            token = response.get('response',{}).get('token','')
            print("Auth Token generated for EWB and Token: ",token)
            return token,companyid
        except Exception as e:
            print("Error Occured in Calling EWB Login IRIS API :",e)
      
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
        try:
            response = requests.post(
                url=IRIS_GSTR1_api_url, 
                headers=request_headers_gst, 
                json=json.loads(json.dumps(payload, default=decimal_default))
            )
            res_status_code = response.status_code
            # print(response.json())
            return response,res_status_code
        except Exception as e:
            print("Error Occured in Calling GSTR1 IRIS API :",e)
    
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
        try:
            response = requests.post(
                url=IRIS_GSTR2_api_url, 
                headers=request_headers_gst, 
                json=json.loads(json.dumps(payload, default=decimal_default))
            )
            res_status_code = response.status_code
            # print(response.json())
            return response,res_status_code
        except Exception as e:
            print("Error Occured in Calling GSTR2 IRIS API :",e)
    

    # IRIS E-INVOICE API
    def InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid):
        IRIS_EINV_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/addInvoice"
        request_headers_einv = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'ONYX',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        # print("Paylod in IRIS API: \n",json.loads(json.dumps(payload, default=decimal_default)))
        
        try:
            response = requests.post(
                url=IRIS_EINV_api_url, 
                headers=request_headers_einv, 
                json=json.loads(json.dumps(payload, default=decimal_default))
            )
            res_status_code = response.status_code
            # try:
            #     servicelogger.info("IRIS E-Invoice API Called")
            # except Exception as e:
            #     print("Error to called logging: ",e)
            print("Response from IRIS API for E-Invoic =\n",response.json())
            print("\nResponse Status Code: ",res_status_code)
            return response,res_status_code
        except Exception as e:
            print("Error Occured during call of IRIS E-Invoice API",e)

    # IRIS E-INVOICE Print PDF
    def  getPDFfromEInvIO(Id, companyId, token, einv_template):
        print("Template from Concurrent: ",einv_template)
        if einv_template == "ILFS -Regular Invoice":
            templateName = "ILFS- Regular Invoice"
        elif einv_template == "ILFS - Credit/Debit Memo":
            templateName = "ILFS - Debit memo"
        else:
            templateName = "ILFS- Regular Invoice"

        IRIS_getPDF_api_url = "https://stage-api.irisgst.com/irisgst/onyx/einvoice/print?template={}&id={}".format(templateName,Id)
        print("E-Invoice Template Name: ",templateName)
        request_headers_einv_Pdf = {
            'companyId':str(companyId),
            'X-Auth-Token':token,
            'product':'ONYX'
        }
        try:
            response = requests.get(
                url=IRIS_getPDF_api_url, 
                headers=request_headers_einv_Pdf
                )
            return response
        except Exception as e:
            print("Error Occured in PDF generation IRIS API ",e)
    
    # IRIS Cancel IRN api 
    def InvokecancelIrn(companyId,token,payload):
        IRIS_cancelIRN_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/cancel"
        request_header_cancelIRN = {
            "accept": "application/json",
            "companyId" : str(companyId),
            "X-Auth-Token": token,
            "product": "ONYX",
            "Content-Type": "application/json"
        }
        try:
            response = requests.put(
                url=IRIS_cancelIRN_api_url, 
                headers=request_header_cancelIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            res_status_code = response.status_code
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(),res_status_code
        except Exception as e:
            print("Error Occured in Calling Cancel IRN IRIS API :",e)
    
    # IRIS Cancel EWB
    def InvokecancelEWB(companyId,token,payload):
        IRIS_cancelEWB_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/cancelEwb"
        request_header_cancelIRN = {
            "accept": "application/json",
            "companyId" : str(companyId),
            "X-Auth-Token": token,
            "product": "ONYX",
            "Content-Type": "application/json"
        }
        try:
            response = requests.put(
                url=IRIS_cancelEWB_api_url, 
                headers=request_header_cancelIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            res_status_code = response.status_code
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(),res_status_code
        except Exception as e:
            print("Error Occured in Calling Cancel EWB IRIS API :",e)
    

    # IRIS EWB Non-IRN
    def InvokeEwbNonIrn(companyId,token,payload):
        IRIS_ewbNonIrn_api_url = "https://stage-api.irisgst.com/irisgst/topaz/api/v0.3/ewb"
        request_header_ewbNonIRN = {
            "accept": "application/json",
            "companyId" : str(companyId),
            "X-Auth-Token": token,
            "product": "TOPAZ",
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(
                url=IRIS_ewbNonIrn_api_url, 
                headers=request_header_ewbNonIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            res_status_code = response.status_code
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(), res_status_code
        except Exception as e:
            print("Error Occured in Calling Non-IRN EWB IRIS API :",e)

    # Print EWB
    def  getPDFfromEwbNo(ewbNo,companyId,token):
        IRIS_getPDFewb_api_url = "https://stage-api.irisgst.com/irisgst/topaz/ewb/print/details"
        request_headers_ewb_Pdf = {
            'companyId':str(companyId),
            'X-Auth-Token':token,
            'product':'TOPAZ'
        }
        payload = {
            "ewbNo": [
                ewbNo
            ]
        }
        try:
            response = requests.get(
                url=IRIS_getPDFewb_api_url, 
                headers=request_headers_ewb_Pdf,
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            return response
        except Exception as e:
            print("Error Occured in PDF generation IRIS API ",e)