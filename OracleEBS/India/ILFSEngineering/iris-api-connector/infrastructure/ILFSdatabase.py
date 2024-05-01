import oracledb
from dotenv import load_dotenv
import os
import json
from datetime import date
import sys

# load_dotenv()
extDataDir = os.getcwd()
if getattr(sys, "frozen", False):
    extDataDir = sys._MEIPASS
load_dotenv(dotenv_path=os.path.join(extDataDir, ".env"))

user_name = os.getenv("user_name")
password = os.getenv("password")
dsn = os.getenv("dsn")
oracle_client_dirpath = os.getenv("oracle_client_dir")
print("oracle_client_dirpath = " , oracle_client_dirpath)

# Connect to Oracle database
oracledb.init_oracle_client(lib_dir=oracle_client_dirpath)
connection = oracledb.connect(
    user = user_name,
    password = password,
    dsn = dsn
    )
Created_by_test ="Test_Creation"

class database:

    # GSTR1
    def executeGSTR1HeaderQuery(from_date, to_date):
        cur = connection.cursor()
        # Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v"
        Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v WHERE TO_DATE(idt,'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
        cur.execute(Header_gstr1_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def executeGSTR1LineQuery(document_No):
        cur = connection.cursor()
        Line_gstr1_Query = "SELECT NVL(SVAL,0),TY,HSN_SC,DESCRIPTION,UQC,QTY,NVL(TXVAL,0),IRT,NVL(IAMT,0),CRT,NVL(CAMT,0),SRT,NVL(SAMT,0),CSRT,NVL(CSAMT,0),TXP,DISC,NVL(ADVAL,0),RT FROM xx_iris_gstr1_v WHERE inum = \'{}\'".format(document_No)
        cur.execute(Line_gstr1_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def persistInsertGstr1RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        cur = connection.cursor()
        json_payload = json.dumps(payload)
        Insert_Query = "INSERT INTO XX_IRIS_GSTR1_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_PAYLOAD, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', '{}')"
        foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id)
        cur.execute(foramat_insert_query)
        connection.commit()
        cur.close()
    
    def persistUpdateGstr1ResponseInDB(response,res_status_code,invoice_id):
        cur = connection.cursor()
        if res_status_code == 200:
            response_data = response.json()
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            status = response_data.get('status')
            response = response_data.get("response", [])
            if status == 'SUCCESS':
                for res in response:
                    message = res.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
            else :
                fieldError = response_data.get("fieldErrors", [])
                for res in fieldError:
                    message = res.get('defaultMessage')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
        
        elif res_status_code == 403:
            response_data = response.json()
            print("Inside status 403")
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': error, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

    # GSTR2
    def executeGSTR2HeaderQuery(from_date, to_date):
        cur = connection.cursor()
        # Header_gstr1_Query = "SELECT distinct INUM, GSTIN, DTY, INVTYP, DST, SPLYTY, CTPY, RTPY, CTIN, CNAME, IDT, VAL, POS, RCHRG, FY, REFNUM, PDT, CPTYCDE ,FP,GEN1,GEN2,GEN3,GEN4,GEN5,GEN6,GEN7,GEN8,GEN9,GEN10,GEN11 FROM xx_iris_gstr2_v"
        Header_gstr1_Query = "SELECT distinct INUM, GSTIN, DTY, INVTYP, DST, SPLYTY, CTPY, RTPY, CTIN, CNAME, IDT, VAL, POS, RCHRG, FY, REFNUM, PDT, CPTYCDE ,FP,GEN1,GEN2,GEN3,GEN4,GEN5,GEN6,GEN7,GEN8,GEN9,GEN10,GEN11 FROM xx_iris_gstr2_v WHERE TO_DATE(idt,'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
        cur.execute(Header_gstr1_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def executeGSTR2LineQuery(document_No):
        cur = connection.cursor()
        Line_gstr1_Query = "SELECT NUM, NVL(SVAL,0), TY, HSN_SC, DESCRIPTION, UQC, QTY, NVL(TXVAL,0), RT, IRT, NVL(IAMT,0), CRT, NVL(CAMT,0), SRT, NVL(SAMT,0), CSRT, NVL(CSAMT,0), ELG, TX_I, TXP FROM xx_iris_gstr2_v  WHERE inum = \'{}\'".format(document_No)
        cur.execute(Line_gstr1_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def persistInsertGstr2RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        cur = connection.cursor()
        json_payload = json.dumps(payload)
        print("Inside  insert request into DB")
        # print("\nPayload: ",json_payload,"\nInvoice ID:",invoice_id,"\nInvoice Date: ",invoice_date,"\nReturn Period: ",return_period)
        # Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE,REQUEST_PAYLOAD, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', '{}')"
        # foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id)
        Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}')"
        foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id)
        
        # print("Insert Query:",foramat_insert_query)
        cur.execute(foramat_insert_query)
        connection.commit()
        print("GSTR2 Insert Query Done")
        cur.close()
    
    def persistUpdateGstr2ResponseInDB(response,res_status_code,invoice_id):
        cur = connection.cursor()
        if res_status_code == 200:
            response_data = response.json()
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            status = response_data.get('status')
            response = response_data.get("response", [])
            if status != 400:
                for res in response:
                    inv_no = res.get('inv_no')
                    status_line = res.get('status')
                    timeStamp = res.get('timeStamp')
                    # date_string = timeStamp.rsplit(' ',2)[0]
                    message = res.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status, 'b': message,'c': 'null' ,'e': invoice_id})
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
            
            else:
               
                fieldError = response_data.get("fieldErrors", [])
                for res in fieldError:
                    message = res.get('defaultMessage')
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status, 'b': message,'c': 'null' ,'e': invoice_id})
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': status,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
        
        elif res_status_code == 403:
            response_data = response.json()
            print("Inside status 403")
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': error, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

        else:
            response_data = response.json()
            print("Inside status other than 200 and 403")
            status = response_data.get('status')
            fieldError = response_data.get("fieldErrors", [])
            for res in fieldError:
                message = res.get('defaultMessage')

            Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': str(status), 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

    # E-INVOICE
    def executeEinvHeaderQuery():
        cur = connection.cursor()
        Header_einv_Query = "SELECT distinct inum, invTyp, splyTy, dst, refnum, pdt, ctpy, ctin, cname, ntNum, ntDt, idt, val, pos, rchrg, fy, dty, rsn, pgst, prs, odnum, gen2, gen7, gen8, gen10, gen11, gen12, gen13, gstin, fp, ft FROM xx_iris_einv_v"
        cur.execute(Header_einv_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def executeEinvLineQuery(document_No):
        cur = connection.cursor()
        Line_einv_Query = "SELECT num, sval, ty, hsnSc, desc, uqc, qty, txval, irt, iamt, crt, camt, srt, samt, csrt, csamt, txp, disc, adval, rt FROM xx_iris_einv_v  WHERE inum = \'{}\'".format(document_No)
        cur.execute(Line_einv_Query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def persistInsertEinvRequestInDB(payload,invoice_id,invoice_date,return_period):
        cur = connection.cursor()
        json_payload = json.dumps(payload)
        Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE,REQUEST_PAYLOAD) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}')"
        foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), Created_by_test, date.today().strftime('%d-%m-%Y'), json_payload)
        cur.execute(foramat_insert_query)
        connection.commit()
        cur.close()
    
    def persistUpdateEinvResponseInDB(response,res_status_code,invoice_id):
        cur = connection.cursor()
        if res_status_code == 200:
            response_data = response.json()
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            status = response_data.get('status')
            response = response_data.get("response", [])
            for res in response:
                inv_no = res.get('inv_no')
                status_line = res.get('status')
                timeStamp = res.get('timeStamp')
                # date_string = timeStamp.rsplit(' ',2)[0]
                message = res.get('message')
            Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': status, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()
        
        elif res_status_code == 403:
            response_data = response.json()
            print("Inside status 403")
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': error, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

