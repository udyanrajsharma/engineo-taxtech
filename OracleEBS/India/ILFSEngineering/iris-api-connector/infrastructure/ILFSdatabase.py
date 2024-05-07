from infrastructure.IRISapiDetails import  apiDetails
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
        response_data = response.json()
        if res_status_code == 200:
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
                failure_status = "FAILURE"
                for res in fieldError:
                    message = res.get('defaultMessage')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
        
        elif res_status_code == 403:
            # print("Inside status 403")
            failure_status = "FAILURE"
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

        else:
            failure_status = "FAILURE"
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
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
        # print("Inside  insert request into DB")
        # print("\nPayload: ",json_payload,"\nInvoice ID:",invoice_id,"\nInvoice Date: ",invoice_date,"\nReturn Period: ",return_period)
        # Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE,REQUEST_PAYLOAD, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', '{}')"
        # foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id)
        Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}')"
        foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id)
        
        # print("Insert Query:",foramat_insert_query)
        cur.execute(foramat_insert_query)
        connection.commit()
        # print("GSTR2 Insert Query Done")
        cur.close()
    
    def persistUpdateGstr2ResponseInDB(response,res_status_code,invoice_id):
        cur = connection.cursor()
        response_data = response.json()
        if res_status_code == 200:
            # print("Inside status 200")
            # Extract fields from the response and save them to another table
            status = response_data.get('status')
            response = response_data.get("response", [])
            if status != 400:
                success_status = "SUCCESS"
                for res in response:
                    inv_no = res.get('inv_no')
                    status_line = res.get('status')
                    timeStamp = res.get('timeStamp')
                    # date_string = timeStamp.rsplit(' ',2)[0]
                    message = res.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': success_status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
            
            else:
                failure_status = "FAILURE"
                fieldError = response_data.get("fieldErrors", [])
                for res in fieldError:
                    message = res.get('defaultMessage')
                    
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                cur.close()
        
        elif res_status_code == 403:
            # print("Inside status 403")
            failure_status = "FAILURE"
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

        else:
            # print("Inside status other than 200 and 403")
            failure_status = "FAILURE"
            status = response_data.get('status')
            fieldError = response_data.get("fieldErrors", [])
            for res in fieldError:
                message = res.get('defaultMessage')

            Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' ,'e': invoice_id})
            connection.commit()
            cur.close()

    # E-INVOICE
    def executeEinvHeaderQuery(from_date, to_date):
        cur = connection.cursor()
        # print("Inside Header Query")
        Header_einv_Query = "select distinct NO doc_num, USERGSTIN, POBCODE, SUPPLYTYPE, NTR, DOCTYPE, CATG, DST, TRNTYP, DT, POS, DIFFPRCNT, ETIN, RCHRG, SGSTIN, STRDNM, SLGLNM, SSTCD, SPH, SEM, BGSTIN, BTRDNM, BLGLNM, BBNM, BFLNO, BLOC, BDST, BSTCD, bpin, BPH, BEM, DGSTIN, DTRDNM, DLGLNM, DBNM, DFLNO, DLOC, DDST, DSTCD, DPIN, DPH, DEM, TOGSTIN, TOTRDNM, TOLGLNM, TOBNM, TOFLNO, TOLOC, TODST, TOSTCD, TOPIN, TOPH, TOEM, SBNUM, SBDT, PORT, EXPDUTY, CNTCD, FORCUR, INVFORCUR, TAXSCH, TOTINVVAL, TOTDISC, TOTFRT, TOTINS, TOTPKG, TOTOTHCHRG, TOTTXVAL, TOTIAMT, TOTCAMT, TOTSAMT, TOTCSAMT, TOTSTCSAMT, RNDOFFAMT, SEC7ACT, INVSTDT, INVENDDT, INVRMK, OMON, ODTY, OINVTYP, OCTIN, USERIRN, PAYNM, ACCTDET, PA, IFSC, PAYTERM, PAYINSTR, CRTRN, DIRDR, CRDAY, BALAMT, PAIDAMT, PAYDUEDT, TRANSID, SUBSPLYTYP, SUBSPLYDES, KDREFINUM, KDREFIDT, TRANSMODE, VEHTYP, TRANSDIST, TRANSNAME, TRANSDOCNO, TRANSDOCDATE, VEHNO,  CLMRFND, RFNDELG, BOEF, FY, REFNUM, PDT, IVST, CPTYCDE, GEN1, GEN2, GEN3, GEN4, GEN5, GEN6, GEN7, GEN8, GEN9, GEN10, GEN11, GEN12, GEN13, GEN14, GEN15, GEN16, GEN17, GEN18, GEN19, GEN20, GEN21, GEN22, GEN23, GEN24, GEN25, GEN26, GEN27, GEN28, GEN29, GEN30, POBEWB, POBRET, TCSRT, TCSAMT, PRETCS, GENIRN, GENEWB, SPIN, refinum, sbnm, sflno, sloc, sdst from XX_ILFS_EINV_DATA_V WHERE TO_DATE(dt,'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)        
        cur.execute(Header_einv_Query)
        rows = cur.fetchall()
        print("Header Query Executed")
        cur.close()
        return rows
    
    def executeEinvLine1Query(document_No):
        cur = connection.cursor()
        # print("Inside Line Item 1 Query")
        Line_einv_Query = "select BARCDE, BCHEXPDT, BCHWRDT, BCHNM, NVL(CAMT,0), CESNONADVAL, STCESNONADVL, NVL(CRT,0), NVL(CSAMT,0), NVL(CSRT,0), DISC, FREEQTY, HSNCD, NVL(IAMT,0), NVL(IRT,0), ISSERVC, ITMGEN1, ITMGEN2, ITMGEN3, ITMGEN4, ITMGEN5, ITMGEN6, ITMGEN7, ITMGEN8, ITMGEN9, ITMGEN10, ITMVAL, NUM, ORDLINEREF, ORGCNTRY, OTHCHRG, PRDDESC, PRDNM, PRDSLNO, PRETAXVAL, QTY, RT, NVL(SAMT,0), NVL(SRT,0), STCSAMT, STCSRT, NVL(SVAL,0), TXP, NVL(TXVAL,0), UNIT, UNITPRICE from XX_ILFS_EINV_DATA_V  where no = '{}'".format(document_No)
        cur.execute(Line_einv_Query)
        rows = cur.fetchall()
        # print("Line Query 1 Executed")
        cur.close()
        return rows
    
    def executeEinvLine2Query(document_No):
        cur = connection.cursor()
        # print("Inside Line Item 2 Query")
        Line_einv_Query = "select URL, DOCS, INFODTLS from XX_ILFS_EINV_DATA_V where no = '{}'".format(document_No)
        cur.execute(Line_einv_Query)
        rows = cur.fetchall()
        # print("Line Query 2 Executed")
        cur.close()
        return rows
    
    def executeEinvLine3Query(document_No):
        cur = connection.cursor()
        # print("Inside Line Item 3 Query")
        Line_einv_Query = "select RAREF, RADT, TENDREF, CONTREF, EXTREF, PROJREF, POREF, POREFDT from XX_ILFS_EINV_DATA_V where no = '{}'".format(document_No)
        cur.execute(Line_einv_Query)
        rows = cur.fetchall()
        # print("Line Query 3 Executed")
        cur.close()
        return rows
    
    def executeEinvLine4Query(document_No):
        cur = connection.cursor()
        # print("Inside Line Item 4 Query")
        Line_einv_Query = "select OINUM, OIDT, OTHREFNO from XX_ILFS_EINV_DATA_V where no = '{}'".format(document_No)
        cur.execute(Line_einv_Query)
        rows = cur.fetchall()
        # print("Line Query 4 Executed")
        cur.close()
        return rows
    
    def persistInsertEinvRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        cur = connection.cursor()
        json_payload = json.dumps(payload)
        Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}')"
        format_insert_query = Insert_Query.format(invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id)
        # print("Insert Query: \n",format_insert_query)
        cur.execute(format_insert_query)
        connection.commit()
        print(" E-invoive Record inserted successfully")
        cur.close()
    
    def persistUpdateEinvResponseInDB(response,res_status_code,invoice_id,gstin, token,companyid):
        cur = connection.cursor()
        response_data = response.json()
        # print("Inside updation of table")
        if res_status_code == 200:
            # print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                qr_code = response_data.get('response').get('qrCode', None)
                iris_no = response_data.get('response').get('no', None)
                iris_id = response_data.get('response').get('id', None)
                status = response_data.get('response').get('status', None)
                ackNo = response_data.get('response').get('ackNo', None)
                ackDt = response_data.get('response').get('ackDt', None)
                irn = response_data.get('response').get('irn', None)
                signedInvoice = response_data.get('response').get('signedInvoice', None)
                signedQrCode = response_data.get('response').get('signedQrCode', None)
                EwbNo = response_data.get('response').get('EwbNo', None)
                EwbDt = response_data.get('response').get('EwbDt', None)
                EwbValidTill = response_data.get('response').get('EwbValidTill', None)

                response_pdf = apiDetails.getPDFfromEInvIO(iris_id,companyid,token)
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, IRIS_QRCODE = :f, IRIS_NO = :g, IRIS_ID = :h,IRIS_STATUS = :i , IRIS_ACK_NO = :j , IRIS_ACK_DATE = :k , IRIS_SIGNED_INVOICE = :l , IRIS_SIGNED_QR_CODE = :m , IRIS_EWB_NO = :n , IRIS_EWB_DATE = :o , IRIS_EWB_VALID_TILL = :p, IRIS_IRN_NO = :q, INVOICE_PDF = :r   where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': response_status, 'b': message,'c': 'null' ,'e': invoice_id, 'f': qr_code, 'g': iris_no, 'h': iris_id, 'i': status, 'j': ackNo, 'k': ackDt, 'l': signedInvoice, 'm': signedQrCode, 'n': EwbNo, 'o': EwbDt, 'p': EwbValidTill, 'q': irn, 'r': response_pdf.content})
                connection.commit()
                # attachment procedure

                print("Invoice detail Updated - success")
                cur.close()
            
            else:
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': response_status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                print("Invoice detail Updated - Structural Error")
                cur.close()

        
        elif res_status_code == 403:
            # print("Inside status 403")
            timestamp = response_data.get('timestamp')
            # date_string = timestamp.rsplit(' ',2)[0]
            status_line = response_data.get('status')
            error = response_data.get('error')
            message = response_data.get('message')
            failure_status = "FAILURE"
            Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' , 'd': response_data,'e': invoice_id})
            connection.commit()
            print("Invoice detail Updated - fail(403)")
            cur.close()
        
        else:
            message = response_data.get('message')
            failure_status = "FAILURE"
            Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' , 'd': response_data,'e': invoice_id})
            connection.commit()
            print("Invoice detail Updated - fail")
            cur.close()

    # Cancel IRN
    def CancelInvoiceQuery(invoice_id):
        cur = connection.cursor()
        irn_query = "SELECT DISTINCT IRIS_IRN_NO, USERGSTIN, TRX_DATE FROM XX_IRIS_EINV_LOG_T WHERE TRX_NUMBER = {}".format(invoice_id)
        cur.execute(irn_query)
        rows = cur.fetchall()
        print("Header Query Executed")
        cur.close()
        return rows
    
    def persistInsertCancelIrnRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        cur = connection.cursor()
        json_payload = json.dumps(payload)
        Insert_Query = "INSERT INTO XX_IRIS_CANCEL_IRN_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID) VALUES ('{}', TO_DATE('{}', 'DD-MM-YYYY'), TO_DATE('{}', 'DD-MM-YYYY'), '{}', TO_DATE('{}', 'DD-MM-YYYY'), '{}')"
        format_insert_query = Insert_Query.format(invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id)
        # print("Insert Query: \n",format_insert_query)
        cur.execute(format_insert_query)
        connection.commit()
        print(" Cancel IRN Record inserted successfully")
        cur.close()

    def persistUpdateCancelIrnResponseInDB(response, res_status_code, invoice_id):
        cur = connection.cursor()
        response_data = response.json()
        # print("Inside updation of table")
        if res_status_code == 200:
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                irn_no = response_data.get('response').get('irn', None)
                cancel_date = response_data.get('response').get('cancelDate', None)
              
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, IRIS_IRN = :x, CANCEL_DATE = :y where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': response_status, 'b': message,'c': 'null' ,'e': invoice_id, 'x': irn_no, 'y': cancel_date})
                connection.commit()
                # attachment procedure

                print("Cancel Invoice Updated - success")
                cur.close()
            
            else:
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c where TRX_NUMBER = :e"
                cur.execute(Update_Query, {'a': response_status, 'b': message,'c': 'null' ,'e': invoice_id})
                connection.commit()
                print("Invoice detail Updated - Structural Error")
                cur.close()
    
        elif res_status_code == 403:
            # print("Inside status 403")
            message = response_data.get("message", '')
            failure_status = "FAILURE"
            Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' , 'd': response_data,'e': invoice_id})
            connection.commit()
            print("Cancel Invoice Updated - fail(403)")
            cur.close()
        
        else:
            message = response_data.get("message", '')
            failure_status = "FAILURE"
            Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c, RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e"
            cur.execute(Update_Query, {'a': failure_status, 'b': message,'c': 'null' , 'd': response_data,'e': invoice_id})
            connection.commit()
            print("Cancel Invoice Updated - fail")
            cur.close()