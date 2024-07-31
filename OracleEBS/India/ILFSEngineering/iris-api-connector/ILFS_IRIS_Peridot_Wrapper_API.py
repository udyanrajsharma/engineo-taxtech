
import json
from flask import Flask, request, jsonify
import requests
from dotenv import load_dotenv
import os

app = Flask(__name__)

class GSTAPIWrapper:
    load_dotenv()
    def __init__(self, base_url, apikey):
        self.base_url = base_url
        self.apikey = apikey



    # Detail_of_taxpayer_wrapper_API
    def Detail_of_taxpayer_wrapper(self, gstin):
        """Fetch GSTIN information from the API."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/search?gstin={gstin}"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json"  
            }
            
            # Send GET request with headers
            response = requests.get(url, headers=headers)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500



    # Return Status of taxpayer wrapper
    def Return_status_of_taxpayer_wrapper(self, gstin):
        """Fetch GSTIN information from the API."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/returnstatus?gstin={gstin}"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json"  # Adjust Content-Type as needed
            }
            
            # Send GET request with headers
            response = requests.get(url, headers=headers)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500
        
    
        
    # PAN to GSTIN details
    def Pan_to_GSTIN_details_wrapper(self, pan):
        """Fetch PAN information from the API."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/pan-search?pan={pan}"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json"  # Adjust Content-Type as needed
            }
            
            # Send GET request with headers
            response = requests.get(url, headers=headers)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500
        
    # E-invoice Status of Taxpayer
    def E_invoice_status_of_taxpayer_wrapper(self, gstin):
        """Fetch GSTIN information from the API."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/v2/get-einvstatus?gstin={gstin}"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json"  # Adjust Content-Type as needed
            }
            
            # Send GET request with headers
            response = requests.get(url, headers=headers)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500
        
    # Taxpayer Score derived by IRIS
    def Taxpayer_Score_derived_by_IRIS_wrapper(self, gstin):
        """Fetch GSTIN information from the API."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/v2/tp-score?gstin={gstin}"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json"  # Adjust Content-Type as needed
            }
            
            # Send GET request with headers
            response = requests.get(url, headers=headers)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500
        
    # Aadhar Verification - Generate OTP
    def Aadhar_Verification_Generate_OTP_wrapper(self,aadhaar_number):
        """Send a POST request to generate OTP for Aadhar verification."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/verification/aadhaar/otp"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json", 
                "accept": "application/json"
            }
            
            # Set up the data payload (body of the POST request)
            data = {
                "aadhaar_number": aadhaar_number
                
            }
            
            # Send POST request with headers and data
            response = requests.post(url, headers=headers, json=data)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            return {"error": f"HTTP error occurred: {http_err}"}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500
        
    
        

    # Aadhar Verification - Verify OTP
    def Aadhar_Verification_verify_otp_wrapper(self, otp, ref_id):
        """Send a POST request to verify OTP for Aadhar verification."""
        try:
            # Construct the full URL
            url = f"{self.base_url}/api/verification/aadhaar/verify"
            
            # Set up headers with the API key
            headers = {
                "apikey": self.apikey,
                "Content-Type": "application/json",
                "accept": "application/json"
            }
            
            # Set up the data payload (body of the POST request)
            data = {
                "otp": otp,
                "ref_id": ref_id
            }

            # Print debug info
            # print("URL:", url)
            # print("Headers:", headers)
            # print("Data:", data)
            
            # Send POST request with headers and data
            response = requests.post(url, headers=headers, json=data)
            
            # Check if the request was successful
            response.raise_for_status()
            
            # Return the JSON data
            return response.json()
        
        except requests.exceptions.HTTPError as http_err:
            # Capture response content for debugging
            error_details = response.text
            print("Response content:", error_details)
            return {"error": f"HTTP error occurred: {http_err}", "details": error_details}, 500
        except Exception as err:
            return {"error": f"An error occurred: {err}"}, 500

# Initialize GSTAPIWrapper with appropriate base URL and API key
api_wrapper = GSTAPIWrapper(
    # base_url="https://taxpayer.irisgst.com/api/search",
    # apikey="ead9d87a-ae98-4a75-9a4f-b52ce13c152c"
    base_url=os.getenv('BASE_URL'),
    apikey=os.getenv('APIKEY')

)

# Detail_of_taxpayer_wrapper_API
@app.route('/ilfs/iris/peridot/taxpayer/detail/wrapper', methods=['GET'])
def detail_of_taxpayer_wrapper():
    gstin = request.args.get('gstin')
    
    if not gstin:
        return jsonify({"error": "Missing GSTIN parameter"}), 400

    gstin_info = api_wrapper.Detail_of_taxpayer_wrapper(gstin)
    
    return jsonify(gstin_info)



#Return Status of taxpayer wrapper 
@app.route('/ilfs/iris/peridot/taxpayer/status/wrapper', methods=['GET'])
def return_status_of_taxpayer_wrapper():
    gstin = request.args.get('gstin')
    
    if not gstin:
        return jsonify({"error": "Missing GSTIN parameter"}), 400

    gstin_info = api_wrapper.Return_status_of_taxpayer_wrapper(gstin)
    
    return jsonify(gstin_info)

# PAN to GSTIN details
@app.route('/ilfs/iris/peridot/pan/wrapper', methods=['GET'])
def pan_to_GSTIN_details_wrapper():
    pan = request.args.get('pan')
    
    if not pan:
        return jsonify({"error": "Missing GSTIN parameter"}), 400

    pan_info = api_wrapper.Pan_to_GSTIN_details_wrapper(pan)
    
    return jsonify(pan_info)

# E-invoice Status of Taxpayer
@app.route('/ilfs/iris/peridot/invoice/wrapper', methods=['GET'])
def e_invoice_status_of_taxpayer_wrapper():
    gstin = request.args.get('gstin')
    
    if not gstin:
        return jsonify({"error": "Missing GSTIN parameter"}), 400

    gstin_info = api_wrapper.E_invoice_status_of_taxpayer_wrapper(gstin)
    
    return jsonify(gstin_info)


# Taxpayer Score derived by IRIS
@app.route('/ilfs/iris/peridot/taxpayer_score/wrapper', methods=['GET'])
def taxpayer_Score_derived_by_IRIS_wrapper():
    gstin = request.args.get('gstin')
    
    if not gstin:
        return jsonify({"error": "Missing GSTIN parameter"}), 400

    gstin_info = api_wrapper.Taxpayer_Score_derived_by_IRIS_wrapper(gstin)
    
    return jsonify(gstin_info)

# Aadhar Verification - Generate OTP
@app.route('/ilfs/iris/peridot/aadhar/generate/otp/wrapper', methods=['POST'])
def aadhar_verification_generate_otp_wrapper():
    aadhaar_number = request.json.get('aadhaar_number')
    
    
    if not aadhaar_number:
        return jsonify({"error": "Missing Aadhar_number parameter"}), 400

    otp_info = api_wrapper.Aadhar_Verification_Generate_OTP_wrapper(aadhaar_number)
    
    return jsonify(otp_info)

# Aadhar Verification - Verify OTP
@app.route('/ilfs/iris/peridot/aadhar/verification/otp/wrapper', methods=['POST'])
def aadhar_Verification_verify_otp_wrapper():
    data = request.json
    otp = data.get('otp')
    ref_id = data.get('ref_id')
    
    # Validate the input
    if not otp:
        return jsonify({"error": "Missing 'otp' parameter"}), 400
    if ref_id is None:
        return jsonify({"error": "Missing 'ref_id' parameter"}), 400

    # Call the API wrapper method
    otp_info = api_wrapper.Aadhar_Verification_verify_otp_wrapper(otp, ref_id)
    
    # Return the response
    return jsonify(otp_info)


if __name__ == "__main__":
    app.run(debug=True)
    






