
from flask import Flask, request, jsonify 
import requests
import json
from decimal import Decimal

app = Flask(__name__) 

login_email = "sapphire@gmail.com"
login_password = "Abcd@12345"

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

@app.route('/iris/ilfs/gstr1/wrapper/api/', methods = ['POST']) 
def irisGstr1Wrapper():
    try:
        print('API execution ...')
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
        print("Company_ID from GSTR1 Login API: ", companyid)
        token = response.get('response',{}).get('token','')

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

        return Gstr1JsonResponse
    except Exception as e:
        message = f"Exception Occured on calling GSTR1 Wrapper API : {e}"
        print(message)
        return jsonify({"result": "error", "message": str(e)})

if __name__ == '__main__': 
    APP_PORT = 6110
    app.run(debug = True, port=APP_PORT,host='0.0.0.0')
