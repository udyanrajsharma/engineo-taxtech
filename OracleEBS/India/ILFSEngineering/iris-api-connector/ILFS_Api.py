from flask import Flask, request, jsonify
from datetime import datetime
import requests
import json
from application.IRISgst import IRISgst

app = Flask(__name__)

@app.route('/ilfs/gstr1/', methods=['POST'])
def api_gstr1():
    try:
        data = request.get_json()
        from_date = data.get('From_date','')
        to_date = data.get('To_Date','')
        created_by = data.get('Created_By','')
        request_id = data.get('Request_Id','')

        IRISgst.gstr1_v(from_date, to_date, created_by, request_id)
        message = "GSTR1 API called successfully AND From date : {} AND To date : {}".format(from_date,to_date)
        return jsonify(message), 200
    
    except Exception as e:
        return jsonify({'result': 'error', 'message': str(e)})
    
@app.route('/ilfs/gstr2/', methods=['POST'])
def api_gstr2():
    try:
        data = request.get_json()
        print("API Called")
        from_date = data.get('From_date','')
        to_date = data.get('To_Date','')
        created_by = data.get('Created_By','')
        request_id = data.get('Request_Id','')

        IRISgst.gstr2_v(from_date, to_date, created_by, request_id)
        message = "GSTR2 API called successfully"
        return jsonify(message), 200
    
    except Exception as e:
        return jsonify({'result': 'error', 'message': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5500, debug=True)


# pyinstaller main.py




