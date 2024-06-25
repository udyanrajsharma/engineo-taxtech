
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

@app.route('/iris/ilfs/gstr2/wrapper/api/', methods = ['POST']) 
def irisGstr2Wrapper():
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
        # print("Company_ID from GSTR2 Login API: ", companyid)
        token = response.get('response',{}).get('token','')

        # IRIS GSTR2 API
        data = request.get_json()
        gstIn = data.get("userGstIn", "")
        gstr2Payload = data.get("payload", "")

        IRIS_GSTR2_api_url = "https://api.irisgst.com/irisgst/sapphire/gstr/addInvoices/GSTR2RiandCdnInvoices?gstin={}".format(gstIn)
        request_headers_gst = {
            'accept': 'application/json',
            'companyId':str(companyid),
            'X-Auth-Token':token,
            'product':'SAPPHIRE',
            'tenant':'asp',
            'Content-Type': 'application/json'
        }
        
        IrisGstr2Apiresponse = requests.post(
            url=IRIS_GSTR2_api_url, 
            headers=request_headers_gst, 
            json=json.loads(json.dumps(gstr2Payload, default=decimal_default))
        )

        Gstr2JsonResponse = IrisGstr2Apiresponse.json()

        return Gstr2JsonResponse
    except Exception as e:
        message = f"Exception Occured on calling GSTR2 Wrapper API : {e}"
        print(message)
        return jsonify({"result": "error", "message": str(e)})

if __name__ == '__main__': 
    APP_PORT = 6210
    app.run(debug = True, port=APP_PORT,host='0.0.0.0')
