import requests
import json
import decimal
from decimal import Decimal
from dotenv import load_dotenv
import os
import sys
import logging

servicelogger_info = logging.getLogger("IRISEWBServiceInfoLogger")
servicelogger_error = logging.getLogger("IRISEWBServiceErrorLogger")

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
        try:
            print("Inside GSTR 1 Login API")
            IRIS_login_api_url = "https://api.irisgst.com/irisgst/mgmt/login"
            request_headers_login = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
            payload ={
                "email": email,
                "password": password
            }
            response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
            response = response1.json()
            companyid = response.get('response',{}).get('companyid','')
            print("Company_ID from GSTR1 Login API: ", companyid)
            token = response.get('response',{}).get('token','')
            return token,companyid
        except Exception as e:
            print("Error Occured in Calling GST Login IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling GST Login IRIS API")
    
    # IRIS E-INV Login API
    def InvokeIRISEinvLoginAPI():
        try:
            IRIS_login_api_url = "https://stage-api.irisgst.com/irisgst/mgmt/login"
            request_headers_login = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
            payload ={
                "email": einv_email,
                "password": einv_password
            }
        
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
            servicelogger_error.exception("Exception Occured in Calling E-INV Login IRIS API")
      
    # IRIS EWB Login API
    def InvokeIRISEwbLoginAPI():
        try:
            IRIS_login_api_url = "https://stage-api.irisgst.com/irisgst/mgmt/login"
            request_headers_login = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            }
            payload ={
                "email": ewb_email,
                "password": ewb_password
            }
            response1 = requests.post(url= IRIS_login_api_url, headers=request_headers_login, json=json.loads(json.dumps(payload)))
            response = response1.json()
            companyid = response.get('response',{}).get('companyid','')
            print("Company_ID: ", companyid)
            token = response.get('response',{}).get('token','')
            print("Auth Token generated for EWB and Token: ",token)
            return token,companyid
        except Exception as e:
            print("Error Occured in Calling EWB Login IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling EWB Login IRIS API")
      
    # IRIS GSTR1 API
    def InvokeIRIS_GSTR1_API(payload,gstIn,token,companyid):
        try:
            print("Inside GSTR1 API")
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
            servicelogger_info.info("Response fetch from IRIS GSTR1 API ")
            print("IRIS GSTR1 API called successfully")
            return response,res_status_code
        except Exception as e:
            print("Error Occured in Calling GSTR1 IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling GSTR1 IRIS API")
    
    # IRIS GSTR2 API
    def InvokeIRIS_GSTR2_API(payload,gstIn,token,companyid):
        try:
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
            servicelogger_info.info("Response fetch from IRIS GSTR2 API ")
            # print(response.json())
            return response,res_status_code
        except Exception as e:
            print("Error Occured in Calling GSTR2 IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling GSTR2 IRIS API")
    

    # IRIS E-INVOICE API
    def InvokeEInvoice_IRIS_API(payload,gstIn,token,companyid):
        try:
            IRIS_EINV_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/addInvoice"
            request_headers_einv = {
                'accept': 'application/json',
                'companyId':str(companyid),
                'X-Auth-Token':token,
                'product':'ONYX',
                'tenant':'asp',
                'Content-Type': 'application/json'
            } 
            response = requests.post(
                url=IRIS_EINV_api_url, 
                headers=request_headers_einv, 
                json=json.loads(json.dumps(payload, default=decimal_default))
            )
            res_status_code = response.status_code
            servicelogger_info.info("Response fetch from IRIS API for Invoice generation")
            # print("Response from IRIS API for E-Invoic =\n",response.json())
            return response,res_status_code
        except Exception as e:
            print("Error Occured during call of IRIS E-Invoice API",e)
            servicelogger_error.exception("Exception Occured in Calling E-Invoice IRIS API")

    # IRIS E-INVOICE Print PDF
    def  getPDFfromEInvIO(Id,companyId,token, einv_template):
        try:
            print("Template from Concurrent: ",einv_template)
            if einv_template == "ILFS -Regular Invoice":
                templateName = "ILFS- Regular Invoice"
            elif einv_template == "ILFS - Credit/Debit Memo":
                templateName = "ILFS - Credit/Debit/Stock"
            else:
                templateName = "ILFS- Regular Invoice"

            servicelogger_info.info(f"Template selected for E-Invoice : {einv_template}")

            IRIS_getPDF_api_url = "https://stage-api.irisgst.com/irisgst/onyx/einvoice/print?template={}&id={}".format(templateName,Id)
            print("E-Invoice Template Name: ",templateName)
            request_headers_einv_Pdf = {
                'companyId':str(companyId),
                'X-Auth-Token':token,
                'product':'ONYX'
            }
        
            response = requests.get(
                url=IRIS_getPDF_api_url, 
                headers=request_headers_einv_Pdf
                )
            servicelogger_info.info(f"E-Invoice print API called with IRIS Template Name : {templateName}")
            return response
        except Exception as e:
            print("Error Occured in PDF generation IRIS API ",e)
            servicelogger_error.exception("Exception Occured in IRIS PDF generation API")
    
    # IRIS Cancel IRN api 
    def InvokecancelIrn(companyId,token,payload):
        try:
            IRIS_cancelIRN_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/cancel"
            request_header_cancelIRN = {
                "accept": "application/json",
                "companyId" : str(companyId),
                "X-Auth-Token": token,
                "product": "ONYX",
                "Content-Type": "application/json"
            }
        
            response = requests.put(
                url=IRIS_cancelIRN_api_url, 
                headers=request_header_cancelIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            res_status_code = response.status_code
            servicelogger_info.info(f"Response fetched from IRIS API for Cancel IRN Invoice")
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(),res_status_code
        except Exception as e:
            print("Error Occured in Calling Cancel IRN IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling Cancel IRN IRIS API")
    
    # IRIS Cancel EWB
    def InvokecancelEWB(companyId,token,payload):
        try:
            IRIS_cancelEWB_api_url = "https://stage-api.irisgst.com/irisgst/onyx/irn/cancelEwb"
            request_header_cancelIRN = {
                "accept": "application/json",
                "companyId" : str(companyId),
                "X-Auth-Token": token,
                "product": "ONYX",
                "Content-Type": "application/json"
            }
        
            response = requests.put(
                url=IRIS_cancelEWB_api_url, 
                headers=request_header_cancelIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            res_status_code = response.status_code
            servicelogger_info.info(f"Response fetched from IRIS API for Cancel E-Way Bill")
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(),res_status_code
        except Exception as e:
            print("Error Occured in Calling Cancel EWB IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling Cancel EWB IRIS API")
    

    # IRIS EWB Non-IRN
    def InvokeEwbNonIrn(companyId,token,payload):
        try:
            IRIS_ewbNonIrn_api_url = "https://stage-api.irisgst.com/irisgst/topaz/api/v0.3/ewb"
            request_header_ewbNonIRN = {
                "accept": "application/json",
                "companyId" : str(companyId),
                "X-Auth-Token": token,
                "product": "TOPAZ",
                "Content-Type": "application/json"
            }
        
            response = requests.post(
                url=IRIS_ewbNonIrn_api_url, 
                headers=request_header_ewbNonIRN, 
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            servicelogger_info.info(f"Response fetched from IRIS E-Way Bill API")
            res_status_code = response.status_code
            # print("Response from IRIS API for Cancel IRN =\n",response.json())
            return response.json(), res_status_code
        except Exception as e:
            print("Error Occured in Calling Non-IRN EWB IRIS API :",e)
            servicelogger_error.exception("Exception Occured in Calling Non-IRN EWB IRIS API")

    # Print EWB
    def  getPDFfromEwbNo(ewbNo,companyId,token):
        try:
            servicelogger_info.info(f"PDF generation IRIS API is called for E-Way Bill No: {ewbNo}")
            IRIS_getPDFewb_api_url = "https://stage-api.irisgst.com/irisgst/topaz/ewb/print/details"
            request_headers_ewb_Pdf = {
                'companyId':str(companyId),
                'X-Auth-Token':token,
                'product':'TOPAZ'
            }
            payload = {
                "ewbNo": [ ewbNo ]
            }   
            response = requests.get(
                url=IRIS_getPDFewb_api_url, 
                headers=request_headers_ewb_Pdf,
                json=json.loads(json.dumps(payload, default=decimal_default))
                )
            return response
        except Exception as e:
            print("Error Occured in PDF generation IRIS API ",e)
            servicelogger_error.exception("Exception Occured in PDF generation IRIS API")