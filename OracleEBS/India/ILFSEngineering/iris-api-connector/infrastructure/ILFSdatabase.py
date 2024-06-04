from infrastructure.IRISapiDetails import  apiDetails
import oracledb
from dotenv import load_dotenv
import os
import json
from decimal import Decimal
from datetime import date
import sys

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError

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
        try:
            cur = connection.cursor()
            # Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v"
            Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v WHERE TO_DATE(idt,'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
            cur.execute(Header_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR1 Header Query from database", e)
    
    def executeGSTR1LineQuery(document_No):
        try:
            cur = connection.cursor()
            Line_gstr1_Query = "SELECT NVL(SVAL,0),TY,HSN_SC,DESCRIPTION,UQC,QTY,NVL(TXVAL,0),IRT,NVL(IAMT,0),CRT,NVL(CAMT,0),SRT,NVL(SAMT,0),CSRT,NVL(CSAMT,0),TXP,DISC,NVL(ADVAL,0),RT FROM xx_iris_gstr1_v WHERE inum = \'{}\'".format(document_No)
            cur.execute(Line_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR1 Line Query from database", e)
    
    def persistInsertGstr1RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        try:
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_GSTR1_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_PAYLOAD, REQUEST_ID) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), :3, TO_DATE(:4, 'DD-MM-YYYY'), :5, TO_DATE(:6, 'DD-MM-YYYY'), :7, :8)"
            bind_var = [invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id]
            # foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id)
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            cur.close()
        except Exception as e:
            print("Error while inserting data into database for GSTR1", e)
        
    def persistUpdateGstr1ResponseInDB(response,res_status_code,invoice_id, request_id):
        try:
            cur = connection.cursor()
            response_data = response.json()
            json_payload = json.dumps(response_data)
            if res_status_code == 200:
                # Extract fields from the response and save them to another table
                status = response_data.get('status')
                response = response_data.get("response", [])
                if status == 'SUCCESS':
                    for res in response:
                        message = res.get('message')
                    Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [status, message, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    cur.close()
                else :
                    fieldError = response_data.get("fieldErrors", [])
                    failure_status = "FAILURE"
                    for res in fieldError:
                        message = res.get('defaultMessage')
                    Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [status, message, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    cur.close()
            
            elif res_status_code == 403:
                # print("Inside status 403")
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()

            else:
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()
        except Exception as e:
            print("Error while update data into database for GSTR1", e)

    # GSTR2
    def executeGSTR2HeaderQuery(from_date, to_date):
        try:
            cur = connection.cursor()
            # Header_gstr1_Query = "SELECT distinct INUM, GSTIN, DTY, INVTYP, DST, SPLYTY, CTPY, RTPY, CTIN, CNAME, IDT, VAL, POS, RCHRG, FY, REFNUM, PDT, CPTYCDE ,FP,GEN1,GEN2,GEN3,GEN4,GEN5,GEN6,GEN7,GEN8,GEN9,GEN10,GEN11 FROM xx_iris_gstr2_v"
            Header_gstr2_Query = "SELECT distinct INUM, GSTIN, DTY, INVTYP, DST, SPLYTY, CTPY, RTPY, CTIN, CNAME, IDT, VAL, POS, RCHRG, FY, REFNUM, PDT, CPTYCDE ,FP,GEN1,GEN2,GEN3,GEN4,GEN5,GEN6,GEN7,GEN8,GEN9,GEN10,GEN11 FROM xx_iris_gstr2_v WHERE TO_DATE(idt,'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
            cur.execute(Header_gstr2_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR2 Header Query from database", e)
    
    def executeGSTR2LineQuery(document_No):
        try:
            cur = connection.cursor()
            Line_gstr1_Query = "SELECT NUM, NVL(SVAL,0), TY, HSN_SC, DESCRIPTION, UQC, QTY, NVL(TXVAL,0), RT, IRT, NVL(IAMT,0), CRT, NVL(CAMT,0), SRT, NVL(SAMT,0), CSRT, NVL(CSAMT,0), ELG, TX_I, TXP FROM xx_iris_gstr2_v  WHERE inum = \'{}\'".format(document_No)
            cur.execute(Line_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR2 Line Query from database", e)
    
    def persistInsertGstr2RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        try:
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), :3, TO_DATE(:4, 'DD-MM-YYYY'), :5, TO_DATE(:6, 'DD-MM-YYYY'), :7, :8)"
            bind_var = [invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id, json_payload]
            
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            cur.close()
        except Exception as e:
            print("Error while inserting data into database for GSTR2", e)
    
    def persistUpdateGstr2ResponseInDB(response,res_status_code,invoice_id, request_id):
        try:
            cur = connection.cursor()
            response_data = response.json()
            json_payload = json.dumps(response_data)
            if res_status_code == 200:
                # print("Inside status 200")
                # Extract fields from the response and save them to another table
                status = response_data.get('status')
                response = response_data.get("response", [])
                if status == 'SUCCESS':
                    success_status = "SUCCESS"
                    for res in response:
                        inv_no = res.get('inv_no')
                        status_line = res.get('status')
                        timeStamp = res.get('timeStamp')
                        # date_string = timeStamp.rsplit(' ',2)[0]
                        message = res.get('message')
                    Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [success_status, message, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    cur.close()
                
                else:
                    failure_status = "FAILURE"
                    fieldError = response_data.get("fieldErrors", [])
                    for res in fieldError:
                        message = res.get('defaultMessage')
                    Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    cur.close()
            
            elif res_status_code == 403:
                # print("Inside status 403")
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()

            else:
                # print("Inside status other than 200 and 403")
                failure_status = "FAILURE"
                status = response_data.get('status')
                fieldError = response_data.get("fieldErrors", [])
                for res in fieldError:
                    message = res.get('defaultMessage')

                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()
        except Exception as e:
            print("Error while update data into database for GSTR2", e)

    # E-INVOICE
    def executeEinvHeaderQuery(from_date, to_date, txn_no, gstin_state):
        try:
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")

            Header_einv_Query = "Select distinct NO doc_num, CASE WHEN userGstin = '10AABCM3722F1Z7' THEN '10AAACI9260R002' WHEN userGstin = '24AABCM3722F1ZY' THEN '24AAACI9260R002' WHEN userGstin = '29AABCM3722F1ZO' THEN '29AAACI9260R002' WHEN userGstin = '29AABCM3722F1Z0' THEN '29AAACI9260R002' WHEN userGstin = '09AABCM3722F1ZQ' THEN '09AAACI9260R002' WHEN userGstin = '36AABCM3722F1ZT' THEN '36AAACI9260R002' WHEN userGstin = '37AABCM3722F1ZR' THEN '37AAACI9260R002' ELSE userGstin END userGstin, POBCODE, SUPPLYTYPE, NTR, DOCTYPE, CATG, DST, TRNTYP, DT, POS, DIFFPRCNT, ETIN, RCHRG, CASE WHEN SGSTIN = '10AABCM3722F1Z7' THEN '10AAACI9260R002' WHEN SGSTIN = '29AABCM3722F1ZO' THEN '29AAACI9260R002' WHEN SGSTIN = '29AABCM3722F1Z0' THEN '29AAACI9260R002' WHEN SGSTIN = '09AABCM3722F1ZQ' THEN '09AAACI9260R002' WHEN SGSTIN = '36AABCM3722F1ZT' THEN '36AAACI9260R002' WHEN SGSTIN = '37AABCM3722F1ZR' THEN '37AAACI9260R002' ELSE SGSTIN END SGSTIN, STRDNM, SLGLNM, SSTCD, ILFSTXNMETHOD, APICATG, BGSTIN, BTRDNM, BLGLNM, BBNM, BFLNO, BLOC, BDST, BSTCD, bpin, BPH, BEM, DGSTIN, DTRDNM, DLGLNM, DBNM, DFLNO, DLOC, DDST, DSTCD, DPIN, DPH, DEM, TOGSTIN, TOTRDNM, TOLGLNM, TOBNM, TOFLNO, TOLOC, TODST, TOSTCD, TOPIN, TOPH, TOEM, SBNUM, SBDT, PORT, EXPDUTY, CNTCD, FORCUR, INVFORCUR, TAXSCH, TOTINVVAL, TOTDISC, TOTFRT, TOTINS, TOTPKG, TOTOTHCHRG, TOTTXVAL, TOTIAMT, TOTCAMT, TOTSAMT, TOTCSAMT, TOTSTCSAMT, RNDOFFAMT, SEC7ACT, INVSTDT, INVENDDT, INVRMK, OMON, ODTY, OINVTYP, OCTIN, USERIRN, PAYNM, ACCTDET, PA, IFSC, PAYTERM, PAYINSTR, CRTRN, DIRDR, CRDAY, BALAMT, PAIDAMT, PAYDUEDT, TRANSID, SUBSPLYTYP, SUBSPLYDES, KDREFINUM, KDREFIDT, TRANSMODE, VEHTYP, TRANSDIST, TRANSNAME, TRANSDOCNO, TRANSDOCDATE, VEHNO,  SELLER_ORG_ID, RFNDELG, BOEF, FY, REFNUM, PDT, IVST, CPTYCDE, GEN1, GEN2, GEN3, GEN4, GEN5, GEN6, GEN7, GEN8, GEN9, GEN10, GEN11, GEN12, GEN13, GEN14, GEN15, GEN16, GEN17, GEN18, GEN19, GEN20, GEN21, GEN22, GEN23, GEN24, GEN25, GEN26, GEN27, GEN28, GEN29, GEN30, POBEWB, POBRET, TCSRT, TCSAMT, PRETCS, GENIRN, GENEWB, SPIN, refinum, sbnm, sflno, sloc, sdst from XX_ILFS_EINV_PRJ_DATA_V WHERE ( ( ( TO_DATE(dt, 'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL ) OR ( no = '{}' AND '{}' IS NOT NULL ) ) AND SUBSTR(usergstin,0,2) = NVL('{}',SUBSTR(usergstin,0,2))".format(from_date, to_date, trx_no, trx_no, trx_no, gstin_state)        
            cur.execute(Header_einv_Query)
            rows = cur.fetchall()
            # print("Einvoice Header data: ",rows)
            print("Header Query for E-Invoice Executed")
            cur.close()
            return rows
            # return rows
        except Exception as e:
            print("Error in E-Invoice Header Query:",e)

    def testinvoicelogrecord(from_date, to_date, txn_no):
        try:
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")
            einvLogQuery = "select RESPONSE_STATUS from XX_IRIS_EINV_LOG_T WHERE (( ( TO_DATE(TRX_DATE,'DD-MM-YY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL )  OR ( TRX_NUMBER = '{}' AND '{}' IS NOT NULL ))".format(from_date, to_date,trx_no,trx_no,trx_no) 
            # einvLogQuery = "select RESPONSE_STATUS from XX_IRIS_EINV_LOG_T where TRX_NUMBER = '{}'".format(trx_no)
            cur.execute(einvLogQuery)
            rowsLog = cur.fetchall()
            # print("data from Log Table in E-Invoice: ",rowsLog)
            if rowsLog != []:
                for data in rowsLog[0]:
                    print("data : ",data)
                    if data == 'SUCCESS':
                        print("Inside Success condition in loop")
                        break
            else:
                data = 'None'        
            return data
        except Exception as e:
            print("Error : ",e)
    
    def executeEinvLine1Query(document_No):
        try:
            cur = connection.cursor()
            # print("Inside Line Item 1 Query")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "Select BARCDE, BCHEXPDT, BCHWRDT, BCHNM, NVL(CAMT,0), CESNONADVAL, STCESNONADVL, NVL(CRT,0), NVL(CSAMT,0), NVL(CSRT,0), DISC, FREEQTY, HSNCD, NVL(IAMT,0), NVL(IRT,0), ISSERVC, ITMGEN1, ITMGEN2, ITMGEN3, ITMGEN4, ITMGEN5, ITMGEN6, ITMGEN7, ITMGEN8, ITMGEN9, ITMGEN10, ITMVAL, NUM, ORDLINEREF, ORGCNTRY, OTHCHRG, PRDDESC, PRDNM, PRDSLNO, PRETAXVAL, QTY, RT, NVL(SAMT,0), NVL(SRT,0), STCSAMT, STCSRT, NVL(SVAL,0), TXP, NVL(TXVAL,0), UNIT, round(UNITPRICE,3) from XX_ILFS_EINV_PRJ_DATA_V  where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 1 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in E-Invoice Line Query 1:",e)
    
    def executeEinvLine2Query(document_No):
        try:
            cur = connection.cursor()
            # print("Inside Line Item 2 Query")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "Select URL, DOCS, INFODTLS from XX_ILFS_EINV_PRJ_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 2 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in E-Invoice Line Query 2:",e)
    
    def executeEinvLine3Query(document_No):
        try:
            cur = connection.cursor()
            # print("Inside Line Item 3 Query")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "Select RAREF, RADT, TENDREF, CONTREF, EXTREF, PROJREF, POREF, POREFDT from XX_ILFS_EINV_PRJ_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 3 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in E-Invoice Line Query 3:",e)
    
    def executeEinvLine4Query(document_No):
        try:
            cur = connection.cursor()
            # print("Inside Line Item 4 Query")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "select OINUM, OIDT, OTHREFNO from XX_ILFS_EINV_PRJ_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 4 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in E-Invoice Line Query 4:",e)
    
    def executeEinvStockTransferHeaderQuery(from_date, to_date, txn_no, gstin_state):
        try:
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")
            stockTransfer_einv_Query = "Select distinct NO doc_num, CASE WHEN USERGSTIN = '19AABCM3722F1ZP' THEN '19AAACI9260R002' ELSE USERGSTIN END USERGSTIN, POBCODE, SUPPLYTYPE, NTR, DOCTYPE, CATG, DST, TRNTYP, DT, POS, DIFFPRCNT, ETIN, RCHRG, CASE WHEN SGSTIN = '19AABCM3722F1ZP' THEN '19AAACI9260R002' ELSE SGSTIN END SGSTIN, STRDNM, SLGLNM, SSTCD, ILFSTXNMETHOD, APICATG, BGSTIN, BTRDNM, BLGLNM, BBNM, BFLNO, BLOC, BDST, BSTCD, bpin, BPH, BEM, DGSTIN, DTRDNM, DLGLNM, DBNM, DFLNO, DLOC, DDST, DSTCD, DPIN, DPH, DEM, TOGSTIN, TOTRDNM, TOLGLNM, TOBNM, TOFLNO, TOLOC, TODST, TOSTCD, TOPIN, TOPH, TOEM, SBNUM, SBDT, PORT, EXPDUTY, CNTCD, FORCUR, INVFORCUR, TAXSCH, TOTINVVAL, TOTDISC, TOTFRT, TOTINS, TOTPKG, TOTOTHCHRG, TOTTXVAL, TOTIAMT, TOTCAMT, TOTSAMT, TOTCSAMT, TOTSTCSAMT, RNDOFFAMT, SEC7ACT, INVSTDT, INVENDDT, INVRMK, OMON, ODTY, OINVTYP, OCTIN, USERIRN, PAYNM, ACCTDET, PA, IFSC, PAYTERM, PAYINSTR, CRTRN, DIRDR, CRDAY, BALAMT, PAIDAMT, PAYDUEDT, TRANSID, SUBSPLYTYP, SUBSPLYDES, KDREFINUM, KDREFIDT, TRANSMODE, VEHTYP, TRANSDIST, TRANSNAME, TRANSDOCNO, TRANSDOCDATE, VEHNO,  SELLER_ORG_ID, RFNDELG, BOEF, FY, REFNUM, PDT, IVST, CPTYCDE, GEN1, GEN2, GEN3, GEN4, GEN5, GEN6, GEN7, GEN8, GEN9, GEN10, GEN11, GEN12, GEN13, GEN14, GEN15, GEN16, GEN17, GEN18, GEN19, GEN20, GEN21, GEN22, GEN23, GEN24, GEN25, GEN26, GEN27, GEN28, GEN29, GEN30, POBEWB, POBRET, TCSRT, TCSAMT, PRETCS, GENIRN, GENEWB, SPIN, refinum, sbnm, sflno, sloc, sdst from XX_ILFS_EINV_INTORG_DATA_V WHERE ( ( ( TO_DATE(dt, 'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL ) OR ( no = '{}' AND '{}' IS NOT NULL ) ) AND SUBSTR(usergstin,0,2) = NVL('{}',SUBSTR(usergstin,0,2))".format(from_date, to_date, trx_no, trx_no, trx_no, gstin_state)
            cur.execute(stockTransfer_einv_Query)
            rows = cur.fetchall()
            # print("Header Query for Stock Transfer Executed: ",rows)
            cur.close()
            return rows
        except Exception as e:
            print("Error in Header Query for Stock Transfer: ",e)
    
    def executeEinvStockTransferLine1Query(document_No):
        try:
            cur = connection.cursor()
            print("Inside Line Item 1 Query of ST")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "Select BARCDE, BCHEXPDT, BCHWRDT, BCHNM, NVL(CAMT,0), CESNONADVAL, STCESNONADVL, NVL(CRT,0), NVL(CSAMT,0), NVL(CSRT,0), DISC, FREEQTY, HSNCD, NVL(IAMT,0), NVL(IRT,0), ISSERVC, ITMGEN1, ITMGEN2, ITMGEN3, ITMGEN4, ITMGEN5, ITMGEN6, ITMGEN7, ITMGEN8, ITMGEN9, ITMGEN10, ITMVAL, NUM, ORDLINEREF, ORGCNTRY, OTHCHRG, PRDDESC, PRDNM, PRDSLNO, PRETAXVAL, QTY, RT, NVL(SAMT,0), NVL(SRT,0), STCSAMT, STCSRT, NVL(SVAL,0), TXP, NVL(TXVAL,0), UNIT, round(UNITPRICE,3) from XX_ILFS_EINV_INTORG_DATA_V  where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 1 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in Line Query 1 : ",e)
    
    def executeEinvStockTransferLine2Query(document_No):
        try:
            cur = connection.cursor()
            print("Inside Line Item 2 Query of ST")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "select URL, DOCS, INFODTLS from XX_ILFS_EINV_INTORG_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 2 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in Line Query 2:",e)
    
    def executeEinvStockTransferLine3Query(document_No):
        try:
            cur = connection.cursor()
            print("Inside Line Item 3 Query of ST")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "Select RAREF, RADT, TENDREF, CONTREF, EXTREF, PROJREF, POREF, POREFDT from XX_ILFS_EINV_INTORG_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 3 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in Line Query 3:",e)
    
    def executeEinvStockTransferLine4Query(document_No):
        try:
            cur = connection.cursor()
            print("Inside Line Item 4 Query of ST")
            trx_no = document_No.replace("'", "''")
            Line_einv_Query = "select OINUM, OIDT, OTHREFNO from XX_ILFS_EINV_INTORG_DATA_V where no = '{}'".format(trx_no)
            cur.execute(Line_einv_Query)
            rows = cur.fetchall()
            # print("Line Query 4 Executed")
            cur.close()
            return rows
        except Exception as e:
            print("Error in Line Query 4:",e)
    
    def persistInsertEinvRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        try:
            cur = connection.cursor()
            payload_1 = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), TO_DATE(:3, 'DD-MM-YYYY'), :4, TO_DATE(:5, 'DD-MM-YYYY'), :6, :7)"
            bind_variable = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id , payload_1]
            cur.execute(Insert_Query,bind_variable)
            connection.commit()
            print(" E-invoive Record inserted successfully")
            cur.close()
        except Exception as e:
            print("Eroor in E-Invoice data insertion in db: ",e)
        
    def persistInsertEinvGeneratedInDB(invoice_id, invoice_date, created_by, request_id):
        try:
            cur = connection.cursor()
            message = "This Invoice is already generated Successful"
            status = "Already Generated"
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, REQUEST_ID, RESPONSE_MESSAGE, RESPONSE_STATUS) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), TO_DATE(:3, 'DD-MM-YYYY'), :4, :5, :6, :7)"
            bind_variable = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by,  request_id, message, status]
            cur.execute(Insert_Query,bind_variable)
            connection.commit()
            print(" E-invoive Record inserted successfully for already generated E-Invoice")
            cur.close()
        except Exception as e:
            print("Eroor in E-Invoice data insertion in db for already generated E-Invoice: ",e)
    
    def persistUpdateEinvResponseInDB(response,res_status_code,invoice_id,gstin, token,companyid, request_id):
        cur = connection.cursor()
        response_data = response.json()
        json_response = json.dumps(response_data)
        print("Inside updation of table for E-Invoicing")
        if res_status_code == 200:
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                try:
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
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , IRIS_QRCODE = :3, IRIS_NO = :4, IRIS_ID = :5, IRIS_STATUS = :6 , IRIS_ACK_NO = :7 , IRIS_ACK_DATE = :8 , IRIS_SIGNED_INVOICE = :9 , IRIS_SIGNED_QR_CODE = :10 , IRIS_EWB_NO = :11 , IRIS_EWB_DATE = :12 , IRIS_EWB_VALID_TILL = :13, IRIS_IRN_NO = :14, INVOICE_PDF = :15, USERGSTIN = :16,  RESPONSE_PAYLOAD = :17 where TRX_NUMBER = :18 AND REQUEST_ID = :19"
                    bind_var = [response_status, message, qr_code, iris_no, iris_id, status, ackNo, ackDt, signedInvoice, signedQrCode, EwbNo, EwbDt, EwbValidTill, irn, response_pdf.content, gstin, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    # attachment procedure
                    attach_entity = "RA_CUSTOMER_TRX"
                    doc_type = "GENERATE E-INVOICE"
                    attachment_block = "DECLARE P_ATTACH_ENTITY VARCHAR2(200); P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200); P_DOC_TYPE VARCHAR2(200); BEGIN P_ATTACH_ENTITY := '{}'; P_CONC_REQ_ID := {}; P_DOC_NUM := '{}'; P_DOC_TYPE := '{}'; XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC (P_ATTACH_ENTITY => P_ATTACH_ENTITY, P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM, P_DOC_TYPE => P_DOC_TYPE); END;".format(attach_entity, request_id, iris_no, doc_type)
                    cur.execute(attachment_block)
                    connection.commit()
                    print("Invoice detail Updated and attachment - success")
                    cur.close()
                except Exception as e:
                    print("Error in updating the invoice detail in DB",e)
            
            else:
                try:
                    msg_values = [error["msg"] for error in response_data["errors"]]
                    all_msg_values = ", ".join(msg_values)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b ,  RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e AND REQUEST_ID = :z"
                    
                    bind_var = [response_status, all_msg_values, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)                    
                    connection.commit()
                    print("Invoice detail Updated - Structural Error")
                    cur.close()
                except Exception as e:
                    print("Error in all error values in a variable: ",e)
         
        elif res_status_code == 403:
            try:
                print("Inside status 403")
                message = response_data.get('message')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail(403)")
                cur.close()
            except Exception as e:
                print("Error Occured: ",e)
        
        else:
            try:
                message = response_data.get('message')
                failure_status = "FAILURE"
                print("Inside other than 200 and 403 error and \n Error Message:",message, "\nResponse data: ",response_data)
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b,  RESPONSE_PAYLOAD = :d  where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail")
                cur.close()
            except Exception as e:
                print("Error in updating the invoice detail in DB",e)

    def persistUpdateEinvStockTransforResponseInDB(response,res_status_code,invoice_id,gstin, token,companyid, request_id):
        cur = connection.cursor()
        response_data = response.json()
        json_response = json.dumps(response_data)
        print("Inside updation of table for Stock transfer")
        if res_status_code == 200:
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                try:
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
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , IRIS_QRCODE = :3, IRIS_NO = :4, IRIS_ID = :5, IRIS_STATUS = :6 , IRIS_ACK_NO = :7 , IRIS_ACK_DATE = :8 , IRIS_SIGNED_INVOICE = :9 , IRIS_SIGNED_QR_CODE = :10 , IRIS_EWB_NO = :11 , IRIS_EWB_DATE = :12 , IRIS_EWB_VALID_TILL = :13, IRIS_IRN_NO = :14, INVOICE_PDF = :15, USERGSTIN = :16,  RESPONSE_PAYLOAD = :17 where TRX_NUMBER = :18 AND REQUEST_ID = :19"
                    bind_var = [response_status, message, qr_code, iris_no, iris_id, status, ackNo, ackDt, signedInvoice, signedQrCode, EwbNo, EwbDt, EwbValidTill, irn, response_pdf.content, gstin, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                except Exception as e:
                    print("Errpr Occured : ",e)
                print("Invoice detail Updated and attachment - success")
                cur.close()
            
            else:
                try:
                    msg_values = [error["msg"] for error in response_data["errors"]]
                    all_msg_values = ", ".join(msg_values)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b ,  RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e AND REQUEST_ID = :z"                    
                    bind_var = [response_status, all_msg_values, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)                    
                    connection.commit()
                except Exception as e:
                    print("Error in all error values in a variable: ",e)
                print("Invoice detail Updated - Structural Error")
                cur.close()
        
        elif res_status_code == 403:
            try:
                print("Inside status 403")
                message = response_data.get('message')
                failure_status = "FAILURE"           
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
            except Exception as e:
                print("Error Occured: ",e)
            print("Invoice detail Updated - fail(403)")
            cur.close()
        
        else:
            try:
                message = response_data.get('message')
                failure_status = "FAILURE"
                print("Inside other than 200 and 403 error and \n Error Message:",message, "\nResponse data: ",response_data)
                
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b,  RESPONSE_PAYLOAD = :d  where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail")
                cur.close()
            except Exception as e:
                print("Error in updating the invoice detail in DB",e)

    # Cancel IRN
    def CancelInvoiceQuery(invoice_id):
        try:
            print("Inside Cancel IRN Query")
            cur = connection.cursor()
            responseMessage = 'SUCCESS'
            irn_query = "SELECT DISTINCT IRIS_IRN_NO, USERGSTIN, TO_CHAR(TRX_DATE, 'DD-MM-YYYY'), IRIS_EWB_NO, IRIS_ID  FROM XX_IRIS_EINV_LOG_T WHERE RESPONSE_STATUS = '{}' AND TRX_NUMBER = '{}'".format(responseMessage,invoice_id)
            cur.execute(irn_query)
            rows = cur.fetchall()
            # print("Header Query Executed: ",rows)
            cur.close()
            return rows
        except Exception as e:
                print("Error in the invoice detail for cancelling IRN :",e)
    
    def persistInsertCancelIrnRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        try:
            cur = connection.cursor()
            json_payload = json.dumps(payload)        
            Insert_Query = "INSERT INTO XX_IRIS_CANCEL_IRN_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES ( :1, TO_DATE( :2, 'DD-MM-YYYY'), TO_DATE( :3, 'DD-MM-YYYY'), :4, TO_DATE( :5, 'DD-MM-YYYY'), :6, :7)"            
            bind_var = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id, json_payload]
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            print(" Cancel IRN Record inserted successfully")
            cur.close()
        except Exception as e:
                print("Error in insert the invoice detail in DB for Cancel IRN :",e)

    def persistUpdateCancelIrnResponseInDB(response_data, res_status_code, invoice_id, request_id, iris_id, companyId, token):
        cur = connection.cursor()
        json_payload = json.dumps(response_data)
        print("Response : ",json_payload)
        if res_status_code == 200:
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                try:
                    irn_no = response_data.get('response').get('irn', None)
                    cancel_date = response_data.get('response').get('cancelDate', None)
                    response_pdf = apiDetails.getPDFfromEInvIO(iris_id,companyId,token)       
                    Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c, INVOICE_PDF = :d, IRIS_IRN = :x, CANCEL_DATE = :y where TRX_NUMBER = :e AND REQUEST_ID = :z"
                    bind_var = [response_status, message, json_payload, response_pdf.content ,irn_no, cancel_date, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    # cur.execute(Update_Query, {'a': response_status, 'b': message,'c': 'null' ,'e': invoice_id, 'x': irn_no, 'y': cancel_date, 'z': request_id})                  
                    connection.commit()
                    print("Cancel Invoice Updated - success")
                    # attachment procedure
                    attach_entity = "RA_CUSTOMER_TRX"
                    doc_type = "CANCEL E-INVOICE"
                    attachment_block = "DECLARE P_ATTACH_ENTITY VARCHAR2(200); P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200); P_DOC_TYPE VARCHAR2(200); BEGIN P_ATTACH_ENTITY := '{}'; P_CONC_REQ_ID := {}; P_DOC_NUM := '{}'; P_DOC_TYPE := '{}'; XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC (P_ATTACH_ENTITY => P_ATTACH_ENTITY, P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM, P_DOC_TYPE => P_DOC_TYPE); END;".format(attach_entity, request_id, invoice_id, doc_type)
                    cur.execute(attachment_block)
                    connection.commit()
                    print("Invoice detail Updated and attachment ")
                    
                    cur.close()
                except Exception as e:
                    print("Error : ",e)
            
            else:
                try:
                    fail_message = response_data['errors'][0]['msg']
                    print(fail_message)
                    Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                    bind_var = [response_status, fail_message, json_payload, invoice_id, request_id]
                    # cur.execute(Update_Query, {'a': response_status, 'b': fail_message,'c': 'null' ,'e': invoice_id, 'z': request_id})
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    print("Invoice detail Updated - Structural Error")
                    
                    cur.close()
                except Exception as e:
                    print("Error : ",e)
    
        elif res_status_code == 403:
            try:
                # print("Inside status 403")
                message = response_data.get("message", '')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Cancel Invoice Updated - fail(403)")
                cur.close()
            except Exception as e:
                    print("Error : ",e)
        
        else:
            try:
                message = response_data.get("message", '')
                # print("Message in 400: ",message)
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Cancel Invoice Updated - fail")
                cur.close()
            except Exception as e:
                    print("Error : ",e)

    # E-Way Bill for Non-IRN
    def executeEwbHeaderQuery(document_No):
        try:
            print("Inside Header Query for EWB")
            cur = connection.cursor()
            trx_no = document_No.replace("'", "''")
            Header_ewbNonIRN_Query = "SELECT distinct no, supplyType,  CASE WHEN subSplyTypewb = 'Job Work' THEN '4' WHEN subSplyTypewb = 'Supply' THEN '1' WHEN subSplyTypewb = 'Import' THEN '2' WHEN subSplyTypewb = 'Export' THEN '3' ELSE subSplyTypewb END subSplyTypewb, ewbDocType, catg, docDate, CASE WHEN trnTyp = 'REG' THEN '1' ELSE trnTyp END trnTyp, sgstin, strdNm, dgstin, dtrdNm, sbnm, sflno, sloc, sstcd, spin, bgstin, btrdNm, togstin, totrdNm, bbnm, bflno, bloc, bpin, bstcd, CASE WHEN transMode = 'ROAD' THEN '1' WHEN transMode = 'RAIL' THEN '2' WHEN transMode = 'AIR' THEN '3' WHEN transMode = 'SHIP' THEN '4' ELSE transMode END transMode, transDist, EWB_transDocDate, transDocNo, transId, transName, vehNo, vehTyp, userGstin FROM XX_ILFS_EINV_INTORG_DATA_V WHERE NO = '{}'".format(trx_no)
            cur.execute(Header_ewbNonIRN_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error : ",e)
    
    def executeEwbLineQuery(document_No):
        print("Inside Line Item Query for EWB")
        try:
            cur = connection.cursor()
            trx_no = document_No.replace("'", "''")
            Line_ewbLine_Query = "SELECT prdNm, prdDesc, hsnCd, qty, NVL(txval,0), srt, crt, irt, csrt, NVL(samt,0), NVL(camt,0), NVL(iamt,0), NVL(csamt,0), cesNonAdval, txp FROM XX_ILFS_EINV_INTORG_DATA_V WHERE NO = '{}'".format(trx_no)
            # print("Line Query: ",Line_ewbLine_Query)
            cur.execute(Line_ewbLine_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error Occured to Call Line Query = ",e)
    
    def persistInsertEWBRequestInDB(payload, doc_no, createdBy, requestId):
        try:
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            print("EWB Insert in table AND \ndate: ",date.today().strftime('%d-%m-%Y'))
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER,  REQUEST_PAYLOAD, CREATED_BY, CREATION_DATE, REQUEST_ID) VALUES (:1, :2, :3, TO_DATE(:4, 'DD-MM-YYYY'), :5)"
            # foramat_insert_query = Insert_Query.format(doc_no, json_payload, createdBy, date.today().strftime('%d-%m-%Y'), requestId)
            bind_var = [doc_no, json_payload, createdBy, date.today().strftime('%d-%m-%Y'), requestId ]
            cur.execute(Insert_Query, bind_var)
            
            connection.commit()
            cur.close()
        except Exception as e:
            print("Error Occured to Insert EWB Request in DB = ",e)

    def persistUpdateEWBResponseInDB(response_data, res_status_code, invoice_id, companyid, token, request_id):
        cur = connection.cursor()
        json_payload = json.dumps(response_data)
        print("Inside updation of table and \nResponse :",json_payload)
        if res_status_code == 200:
            print("Inside status 200")
            # Extract fields from the response and save them to another table
            response_status = response_data.get('status')
            message = response_data.get("message", '')
            if response_status == "SUCCESS" :
                try:
                    ewbNo = response_data.get('response').get('ewbNo', None)
                    trxdate = response_data.get('response').get('docDate', None)
                    ewbDate = response_data.get('response').get('ewbDate', None)
                    validUpto = response_data.get('response').get('validUpto', None)
                    userGstin = response_data.get('response').get('userGstin', None)
                    uploadTime = response_data.get('response').get('generatedOn', None)
                    last_updateBy = response_data.get('response').get('generatedBy', None)
                    
                    response_pdf = apiDetails.getPDFfromEwbNo(ewbNo,companyid,token)
                
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 , RESPONSE_MESSAGE = :2 , UPLOAD_TIME = :3 , LAST_UPDATED_BY = :4 , LAST_UPDATE_DATE = :5 , RESPONSE_PAYLOAD = :6 , INVOICE_PDF = :7 , IRIS_EWB_NO = :8 , IRIS_EWB_DATE = :9 , IRIS_EWB_VALID_TILL = :10, USERGSTIN = :11, TRX_DATE = :12 where TRX_NUMBER = :13 AND REQUEST_ID = :14"
                    bind_var = [response_status, message, uploadTime, last_updateBy, date.today().strftime('%d-%m-%Y'), json_payload, response_pdf.content, ewbNo, ewbDate, validUpto, userGstin, trxdate, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()

                    print("Cancel Invoice Updated - success")
                    cur.close()
                except Exception as e:
                    print("Error :",e)
            
            else:
                try:
                    msg_values = [error["defaultMessage"] for error in response_data["fieldErrors"]]
                    all_msg_values = ", ".join(msg_values)
                    print("Error Message :",all_msg_values)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2, RESPONSE_PAYLOAD = :3  where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [response_status, all_msg_values, json_payload, invoice_id ,request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    print("Invoice detail Updated - Structural Error")
                    cur.close()
                except Exception as e:
                    print("Error :",e)
    
        elif res_status_code == 403:
            try:
                # print("Inside status 403")
                message = response_data.get("message", '')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Cancel Invoice Updated - fail(403)")
                cur.close()
            except Exception as e:
                    print("Error :",e)
        
        else:
            try:
                message = response_data.get("message", '')
                # print("Message in 400: ",message)
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Cancel Invoice Updated - fail")
                cur.close()
            except Exception as e:
                    print("Error :",e)