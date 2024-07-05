
from flask import Flask, request, jsonify 
import requests

app = Flask(__name__) 

@app.route('/cleartax-wrapper', methods = ['POST']) 
def cleartaxWrapper():
    try:
        print('API execution ...')
        #PROD ClearTax URL    
        # clearTaxReqUrl = 'https://api.cleartax.com/middle-east/ksa/einvoicing/v2/einvoices/generate'
        #SANDBOX ClearTax URL    
        clearTaxReqUrl = 'https://api-sandbox.cleartax.com/middle-east/ksa/einvoicing/v2/einvoices/generate'
        clearTaxReqHeaders = {'X-Cleartax-Auth-Token' : request.headers['X-Cleartax-Auth-Token'], 'VAT' : request.headers['VAT'], 'Content-Type': request.headers['Content-Type'], 'Content-Length': request.headers['Content-Length'] }

        clearTaxReqBody = request.json
        
        invoice_no = clearTaxReqBody.get('EInvoice').get('ID').get('en','')
        print("Invoking ClearTax API for invoice ", invoice_no)
        response =  requests.request('POST', url=clearTaxReqUrl, json = clearTaxReqBody, headers = clearTaxReqHeaders)
        print("ClearTax API invocation succeeded for invoice ", invoice_no)
        clearTaxResBody =  response.json()
        # print('clearTaxResBody = ',clearTaxResBody)

        return clearTaxResBody
    except requests.exceptions.RequestException as req_exception:
        print(f"RequestException: {str(req_exception)}")
        return jsonify({
            'status_code': 500,
            'body': f'Failed to invoke ClearTax API for invoice {invoice_no}. Error: {str(req_exception)}'
        })




if __name__ == '__main__': 
    # SANDBOX App port
    APP_PORT = 6000
    # PROD App port
    # APP_PORT = 6001
    app.run(debug = True, port=APP_PORT,host='0.0.0.0')
