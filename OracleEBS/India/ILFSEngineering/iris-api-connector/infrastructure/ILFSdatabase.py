from infrastructure.IRISapiDetails import  apiDetails
import oracledb
from dotenv import load_dotenv
import os
import json
from decimal import Decimal
from datetime import date
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

user_name = os.getenv("user_name")
password = os.getenv("password")
dsn = os.getenv("dsn")
oracle_client_dirpath = os.getenv("oracle_client_dir")
print("oracle_client_dirpath = " , oracle_client_dirpath)


class database:

    def getDatabaseConnection():
        try:
            oracledb.init_oracle_client(lib_dir=oracle_client_dirpath)
            connection = oracledb.connect(
                user = user_name,
                password = password,
                dsn = dsn
                )
            # servicelogger_info.info("Database Connected")
            print("Database Connected...")
            return connection
        except Exception as e:
            servicelogger_error.exception("Exception occured in Database connection")

    # GSTR1
    def executeGSTR1HeaderQuery(from_date, to_date, request_id):
        try:
            print("Inside GSTR1 Header query")
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            # Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v"
            Header_gstr1_Query = "SELECT distinct INUM,INVTYP,SPLYTY,DST,REFNUM,IDT,CTPY,CTIN,CNAME,NTNUM,NTDT,VAL,POS,RCHRG,FY,DTY,RSN,P_GST,GEN2,GEN7,GEN8,GEN10,GEN11,GEN12,GEN13,GSTIN,FP FROM xx_iris_gstr1_v WHERE TRX_DATE BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
            cur.execute(Header_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            servicelogger_info.info(f"Total records for GSTR1 fetch from database Date from {from_date} to date {to_date} for Request Id: {request_id}")
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR1 Header Query from database", e)
            servicelogger_error.exception(f"Exception occured while executing GSTR1 Header Query from database for Request Id: {request_id}")
        finally:
            connection.close()
    
    def executeGSTR1LineQuery(document_No):
        try:
            print("Inside GSTR1 Line Item query")
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            Line_gstr1_Query = "SELECT NVL(SVAL,0),TY,HSN_SC,DESCRIPTION,UQC,QTY,NVL(TXVAL,0),IRT,NVL(IAMT,0),CRT,NVL(CAMT,0),SRT,NVL(SAMT,0),CSRT,NVL(CSAMT,0),TXP,DISC,NVL(ADVAL,0),RT FROM xx_iris_gstr1_v WHERE inum = \'{}\'".format(document_No)
            cur.execute(Line_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR1 Line Query from database", e)
            servicelogger_error.exception("Exception occured while executing GSTR1 Line Item Query from database")
        finally:
            connection.close()
    
    def persistInsertGstr1RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        try:
            print("Inside data insertion for GSTR1")
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_GSTR1_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_PAYLOAD, REQUEST_ID) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), :3, TO_DATE(:4, 'DD-MM-YYYY'), :5, TO_DATE(:6, 'DD-MM-YYYY'), :7, :8)"
            bind_var = [invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id]
            # foramat_insert_query = Insert_Query.format(invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), json_payload, request_id)
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            cur.close()
            
            servicelogger_info.info(f"Data inserted for GSTR1 into database for Invoice No: {invoice_id} and Request No: {request_id}")
            print("Data inserted for GSTR1 into database for Invoice")
        except Exception as e:
            print("Error while inserting data into database for GSTR1", e)
            servicelogger_error.exception(f"Exception occured while inserting data into database for GSTR1 for Invoice No: {invoice_id}")
        finally:
            connection.close()
        
    def persistUpdateGstr1ResponseInDB(response,res_status_code,invoice_id, request_id):
        try:
            print("Inside data updation for GSTR1")
            connection = database.getDatabaseConnection()
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
                    servicelogger_info.info(f"Data updated into database (GSTR1) for Invoice No: {invoice_id}")
                    print("Record update for GSTR1")

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
                    servicelogger_info.info(f"Data updated into database (GSTR1) for Invoice No: {invoice_id}")
                    print("Record update for GSTR1")
            
            elif res_status_code == 403:
                # print("Inside status 403")
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()
                servicelogger_info.info(f"Data updated into database (GSTR1) for Invoice No: {invoice_id}")
                print("Record update for GSTR1")

            else:
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR1_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()
                servicelogger_info.info(f"Data updated into database (GSTR1) for Invoice No: {invoice_id}")
                print("Record update for GSTR1")

        except Exception as e:
            print("Error while update data into database for GSTR1", e)
            servicelogger_error.exception(f"Exception occured while update data into database for GSTR1 for Invoice No: {invoice_id}")
        finally:
            connection.close()

    # GSTR2
    def executeGSTR2HeaderQuery(from_date, to_date, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            Header_gstr2_Query = "SELECT distinct INUM, GSTIN, DTY, INVTYP, DST, SPLYTY, CTPY, RTPY, CTIN, CNAME, IDT, VAL, POS, RCHRG, FY, REFNUM, PDT, CPTYCDE ,FP,GEN1,GEN2,GEN3,GEN4,GEN5,GEN6,GEN7,GEN8,GEN9,GEN10,GEN11 FROM xx_iris_gstr2_v WHERE TRX_DATE BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY')".format(from_date, to_date)
            cur.execute(Header_gstr2_Query)
            rows = cur.fetchall()
            cur.close()
            servicelogger_info.info(f"Total records for GSTR2 fetch from database Date from {from_date} to date {to_date} for Request Id: {request_id}")
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR2 Header Query from database", e)
            servicelogger_error.exception(f"Exception occured while executing GSTR2 Header Query from database for Request Id: {request_id}")
        finally:
            connection.close()
    
    def executeGSTR2LineQuery(document_No):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            Line_gstr1_Query = "SELECT NUM, NVL(SVAL,0), TY, HSN_SC, DESCRIPTION, UQC, QTY, NVL(TXVAL,0), RT, IRT, NVL(IAMT,0), CRT, NVL(CAMT,0), SRT, NVL(SAMT,0), CSRT, NVL(CSAMT,0), ELG, TX_I, TXP FROM xx_iris_gstr2_v  WHERE inum = \'{}\'".format(document_No)
            cur.execute(Line_gstr1_Query)
            rows = cur.fetchall()
            cur.close()
            return rows
        except Exception as e:
            print("Error while exwcuting GSTR2 Line Query from database", e)
            servicelogger_error.exception("Exception occured while executing GSTR2 Line Item Query from database")
        finally:
            connection.close()
    
    def persistInsertGstr2RequestInDB(payload,invoice_id,invoice_date,return_period, created_by, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_GSTR2_LOG_T (TRX_NUMBER, TRX_DATE, RETURN_PERIOD, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), :3, TO_DATE(:4, 'DD-MM-YYYY'), :5, TO_DATE(:6, 'DD-MM-YYYY'), :7, :8)"
            bind_var = [invoice_id, invoice_date, return_period, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id, json_payload]
            
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            cur.close()
            
            servicelogger_info.info(f"Data inserted for GSTR2 into database for Invoice No: {invoice_id}")
        except Exception as e:
            print("Error while inserting data into database for GSTR2", e)
            servicelogger_error.exception(f"Exception occured while inserting data into database for GSTR2 for Invoice No: {invoice_id}")
        finally:
            connection.close()
    
    def persistUpdateGstr2ResponseInDB(response,res_status_code,invoice_id, request_id):
        try:
            connection = database.getDatabaseConnection()
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
                    servicelogger_info.info(f"Data updated into database (GSTR2) for Invoice No: {invoice_id}")
                
                else:
                    failure_status = "FAILURE"
                    structureErrorResponse = response_data.get("response", [])
                    for res in structureErrorResponse:
                        fieldError = res.get("fieldErrors", [])
                        for error in fieldError:
                            message = error.get('defaultMessage')
                    Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                    bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    cur.close()
                    servicelogger_info.info(f"Data updated into database (GSTR2) for Invoice No: {invoice_id}")
            
            elif res_status_code == 403:
                # print("Inside status 403")
                failure_status = "FAILURE"
                message = response_data.get('message')
                Update_Query = "UPDATE XX_IRIS_GSTR2_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3 where TRX_NUMBER = :4 AND REQUEST_ID = :5"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                cur.close()
                servicelogger_info.info(f"Data updated into database (GSTR2) for Invoice No: {invoice_id}")

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
                
                servicelogger_info.info(f"Data updated into database (GSTR2) for Invoice No: {invoice_id}")

        except Exception as e:
            print("Error while update data into database for GSTR2", e)
            servicelogger_error.exception(f"Exception occured while update data into database for GSTR2 for Invoice No: {invoice_id}")
        finally:
            connection.close()

    # E-INVOICE
    def executeEinvHeaderQuery(from_date, to_date, txn_no, gstin_state, customer_Gstin, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")
            Header_einv_Query = "Select distinct NO doc_num, userGstin, POBCODE, SUPPLYTYPE, NTR, DOCTYPE, CATG, DST, TRNTYP, DT, POS, DIFFPRCNT, ETIN, RCHRG, SGSTIN, STRDNM, SLGLNM, SSTCD, ILFSTXNMETHOD, APICATG, BGSTIN, BTRDNM, BLGLNM, BBNM, BFLNO, BLOC, BDST, BSTCD, bpin, BPH, BEM, DGSTIN, DTRDNM, DLGLNM, DBNM, DFLNO, DLOC, DDST, DSTCD, DPIN, DPH, DEM, TOGSTIN, TOTRDNM, TOLGLNM, TOBNM, TOFLNO, TOLOC, TODST, TOSTCD, TOPIN, TOPH, TOEM, SBNUM, SBDT, PORT, EXPDUTY, CNTCD, FORCUR, INVFORCUR, TAXSCH, TOTINVVAL, TOTDISC, TOTFRT, TOTINS, TOTPKG, TOTOTHCHRG, TOTTXVAL, TOTIAMT, TOTCAMT, TOTSAMT, TOTCSAMT, TOTSTCSAMT, RNDOFFAMT, SEC7ACT, INVSTDT, INVENDDT, INVRMK, OMON, ODTY, OINVTYP, OCTIN, USERIRN, PAYNM, ACCTDET, PA, IFSC, PAYTERM, PAYINSTR, CRTRN, DIRDR, CRDAY, BALAMT, PAIDAMT, PAYDUEDT, TRANSID, SUBSPLYTYP, SUBSPLYDES, KDREFINUM, KDREFIDT, TRANSMODE, VEHTYP, TRANSDIST, TRANSNAME, TRANSDOCNO, TRANSDOCDATE, VEHNO,  SELLER_ORG_ID, RFNDELG, BOEF, FY, REFNUM, PDT, IVST, CPTYCDE, GEN1, GEN2, GEN3, GEN4, GEN5, GEN6, GEN7, GEN8, GEN9, GEN10, GEN11, GEN12, GEN13, GEN14, GEN15, GEN16, GEN17, GEN18, GEN19, GEN20, GEN21, GEN22, GEN23, GEN24, GEN25, GEN26, GEN27, GEN28, GEN29, GEN30, POBEWB, POBRET, TCSRT, TCSAMT, PRETCS, GENIRN, GENEWB, SPIN, refinum, sbnm, sflno, sloc, sdst from XX_ILFS_EINV_PRJ_DATA_V WHERE ( ( ( TO_DATE(dt, 'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL ) OR ( no = '{}' AND '{}' IS NOT NULL ) ) AND SUBSTR(usergstin,0,2) = NVL('{}',SUBSTR(usergstin,0,2))".format(from_date, to_date, trx_no, trx_no, trx_no, gstin_state)        
            cur.execute(Header_einv_Query)
            rows = cur.fetchall()
            # print("Einvoice Header data: ",rows)
            print("Header Query for E-Invoice Executed")
            cur.close()
            servicelogger_info.info(f"Total records fetched from database for the Invoice for Request Id: {request_id}")
            return rows
            # return rows
        except Exception as e:
            print("Error in E-Invoice Header Query:",e)
            servicelogger_error.exception("Exception occured while executing E-Invoice Header Query from database")
        finally:
            connection.close()
      
    def testinvoicelogrecord(from_date, to_date, txn_no):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")
            einvLogQuery = "select RESPONSE_STATUS from XX_IRIS_EINV_LOG_T WHERE (( ( TO_DATE(TRX_DATE,'DD-MM-YY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL )  OR ( TRX_NUMBER = '{}' AND '{}' IS NOT NULL ))".format(from_date, to_date,trx_no,trx_no,trx_no) 
            # einvLogQuery = "select RESPONSE_STATUS from XX_IRIS_EINV_LOG_T where TRX_NUMBER = '{}'".format(trx_no)
            cur.execute(einvLogQuery)
            rowsLog = cur.fetchall()
            
            print("data from Log Table in E-Invoice: ",rowsLog)
            if rowsLog != []:
                for data in rowsLog:
                    print("data : ",data)
                    if 'SUCCESS' in data:
                        print("Inside Success condition in loop and break")
                        record = data[0]
                        break
            else:
                record = 'None' 
            servicelogger_info.info(f"Invoice check from database for already generated for a Invoice No:{trx_no} and already Response status in Log Table: {data}") 
            cur.close() 
            return record
        except Exception as e:
            print("Error : ",e)
            servicelogger_error.exception(f"Exception Occured during checking already generate E-Invoice for Transaction No: {trx_no}")
        finally:
            connection.close()
    
    def executeEinvLine1Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing E-Inv Line Item Query 1 from database")
        finally:
            connection.close()
       
    def executeEinvLine2Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing E-Inv Line Item Query 2 from database")
        finally:
            connection.close()
    
    def executeEinvLine3Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing E-Inv Line Item Query 3 from database")
        finally:
            connection.close()
    
    def executeEinvLine4Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing E-Inv Line Item Query 4 from database")
        finally:
            connection.close()
    
    def executeEinvStockTransferHeaderQuery(from_date, to_date, txn_no, gstin_state, customer_Gstin, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            trx_no = txn_no.replace("'", "''")
            stockTransfer_einv_Query = "Select distinct NO doc_num, USERGSTIN, POBCODE, SUPPLYTYPE, NTR, DOCTYPE, CATG, DST, TRNTYP, DT, POS, DIFFPRCNT, ETIN, RCHRG, SGSTIN, STRDNM, SLGLNM, SSTCD, ILFSTXNMETHOD, APICATG, BGSTIN, BTRDNM, BLGLNM, BBNM, BFLNO, BLOC, BDST, BSTCD, bpin, BPH, BEM, DGSTIN, DTRDNM, DLGLNM, DBNM, DFLNO, DLOC, DDST, DSTCD, DPIN, DPH, DEM, TOGSTIN, TOTRDNM, TOLGLNM, TOBNM, TOFLNO, TOLOC, TODST, TOSTCD, TOPIN, TOPH, TOEM, SBNUM, SBDT, PORT, EXPDUTY, CNTCD, FORCUR, INVFORCUR, TAXSCH, TOTINVVAL, TOTDISC, TOTFRT, TOTINS, TOTPKG, TOTOTHCHRG, TOTTXVAL, TOTIAMT, TOTCAMT, TOTSAMT, TOTCSAMT, TOTSTCSAMT, RNDOFFAMT, SEC7ACT, INVSTDT, INVENDDT, INVRMK, OMON, ODTY, OINVTYP, OCTIN, USERIRN, PAYNM, ACCTDET, PA, IFSC, PAYTERM, PAYINSTR, CRTRN, DIRDR, CRDAY, BALAMT, PAIDAMT, PAYDUEDT, TRANSID, SUBSPLYTYP, SUBSPLYDES, KDREFINUM, KDREFIDT, TRANSMODE, VEHTYP, TRANSDIST, TRANSNAME, TRANSDOCNO, TRANSDOCDATE, VEHNO,  SELLER_ORG_ID, RFNDELG, BOEF, FY, REFNUM, PDT, IVST, CPTYCDE, GEN1, GEN2, GEN3, GEN4, GEN5, GEN6, GEN7, GEN8, GEN9, GEN10, GEN11, GEN12, GEN13, GEN14, GEN15, GEN16, GEN17, GEN18, GEN19, GEN20, GEN21, GEN22, GEN23, GEN24, GEN25, GEN26, GEN27, GEN28, GEN29, GEN30, POBEWB, POBRET, TCSRT, TCSAMT, PRETCS, GENIRN, GENEWB, SPIN, refinum, sbnm, sflno, sloc, sdst from XX_ILFS_EINV_INTORG_DATA_V WHERE ( ( ( TO_DATE(dt, 'DD-MM-YYYY') BETWEEN TO_DATE('{}', 'DD-MON-YYYY') AND TO_DATE('{}', 'DD-MON-YYYY') ) AND '{}' IS NULL ) OR ( no = '{}' AND '{}' IS NOT NULL ) ) AND SUBSTR(usergstin,0,2) = NVL('{}',SUBSTR(usergstin,0,2))".format(from_date, to_date, trx_no, trx_no, trx_no, gstin_state)
            cur.execute(stockTransfer_einv_Query)
            rows = cur.fetchall()
            # print("Header Query for Stock Transfer Executed: ",rows)
            servicelogger_info.info(f"Total records fetched from database for the Stock Transfer Invoice for Request Id: {request_id}")
            cur.close()
            return rows
        except Exception as e:
            print("Error in Header Query for Stock Transfer: ",e)
            servicelogger_error.exception("Exception occured while executing Stock transfer E-Inv Header Query from database")
        finally:
            connection.close()
    
    def executeEinvStockTransferLine1Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing Stock transfer E-Inv Line Item Query 1 from database")
        finally:
            connection.close()
    
    def executeEinvStockTransferLine2Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing Stock transfer E-Inv Line Item Query 2 from database")
        finally:
            connection.close()
    
    def executeEinvStockTransferLine3Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing Stock transfer E-Inv Line Item Query 3 from database")
        finally:
            connection.close()
    
    def executeEinvStockTransferLine4Query(document_No):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception("Exception occured while executing Stock transfer E-Inv Line Item Query 4 from database")
        finally:
            connection.close()
    
    def persistInsertEinvRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            payload_1 = json.dumps(payload)
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), TO_DATE(:3, 'DD-MM-YYYY'), :4, TO_DATE(:5, 'DD-MM-YYYY'), :6, :7)"
            bind_variable = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id , payload_1]
            cur.execute(Insert_Query,bind_variable)
            connection.commit()
            print(" E-invoive Record inserted successfully")
            servicelogger_info.info(f"E-invoive Record inserted successfully into database for Invoice No: {invoice_id} and Request Id: {request_id}")
            cur.close()
            
        except Exception as e:
            print("Eroor in E-Invoice data insertion in db: ",e)
            servicelogger_error.exception(f"Exception occured while inserting data into database for Invoice No: {invoice_id}")
        finally:
            connection.close()
        
    def persistInsertEinvGeneratedInDB(invoice_id, invoice_date, created_by, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            message = "This Invoice is already generated Successful"
            status = "Already Generated"
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, REQUEST_ID, RESPONSE_MESSAGE, RESPONSE_STATUS) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), TO_DATE(:3, 'DD-MM-YYYY'), :4, :5, :6, :7)"
            bind_variable = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by,  request_id, message, status]
            cur.execute(Insert_Query,bind_variable)
            connection.commit()
            print(" E-invoive Record inserted successfully for already generated E-Invoice")
            servicelogger_info.info(f"Invoice No: {invoice_id} record inserted successfully into database for already generated E-Invoice")
            cur.close()
            
        except Exception as e:
            print("Eroor in E-Invoice data insertion in db for already generated E-Invoice: ",e)
            servicelogger_error.exception(f"Exception Occured in insert data in database for a already generated Invoice No: {invoice_id}")
        finally:
            connection.close()
    
    def persistUpdateEinvResponseInDB(response,res_status_code,invoice_id,gstin, token,companyid, request_id, einv_template):
        try: 
            connection = database.getDatabaseConnection()   
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
                    response_pdf = apiDetails.getPDFfromEInvIO(iris_id,companyid,token, einv_template)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , IRIS_QRCODE = :3, IRIS_NO = :4, IRIS_ID = :5, IRIS_STATUS = :6 , IRIS_ACK_NO = :7 , IRIS_ACK_DATE = :8 , IRIS_SIGNED_INVOICE = :9 , IRIS_SIGNED_QR_CODE = :10 , IRIS_EWB_NO = :11 , IRIS_EWB_DATE = :12 , IRIS_EWB_VALID_TILL = :13, IRIS_IRN_NO = :14, INVOICE_PDF = :15, USERGSTIN = :16,  RESPONSE_PAYLOAD = :17 where TRX_NUMBER = :18 AND REQUEST_ID = :19"
                    bind_var = [response_status, message, qr_code, iris_no, iris_id, status, ackNo, ackDt, signedInvoice, signedQrCode, EwbNo, EwbDt, EwbValidTill, irn, response_pdf.content, gstin, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    # attachment procedure
                    # attach_entity = "RA_CUSTOMER_TRX"
                    # doc_type = "GENERATE E-INVOICE"
                    # attachment_block = "DECLARE P_ATTACH_ENTITY VARCHAR2(200); P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200); P_DOC_TYPE VARCHAR2(200); BEGIN P_ATTACH_ENTITY := '{}'; P_CONC_REQ_ID := {}; P_DOC_NUM := '{}'; P_DOC_TYPE := '{}'; XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC (P_ATTACH_ENTITY => P_ATTACH_ENTITY, P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM, P_DOC_TYPE => P_DOC_TYPE); END;".format(attach_entity, request_id, iris_no, doc_type)
                    
                    attachment_block = "DECLARE  P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200); BEGIN  P_CONC_REQ_ID := {}; P_DOC_NUM := '{}';  XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC ( P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM); END;".format(request_id, iris_no)                  
                    cur.execute(attachment_block)
                    connection.commit()
                    print("Invoice detail Updated and attachment - success")
                    servicelogger_info.info(f"Invoice Details updated in table and attachment added for Invoice No: {invoice_id} and Request Id: {request_id}")
                    cur.close()
               
                else:
                    msg_values = [error["msg"] for error in response_data["errors"]]
                    all_msg_values = ", ".join(msg_values)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b ,  RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e AND REQUEST_ID = :z"
                    
                    bind_var = [response_status, all_msg_values, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)                    
                    connection.commit()
                    print("Invoice detail Updated - Structural Error")
                    servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                    cur.close()
             
            elif res_status_code == 403:
                print("Inside status 403")
                message = response_data.get('message')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail(403)")
                servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                cur.close()
              
            else:
                message = response_data.get('message')
                failure_status = "FAILURE"
                print("Inside other than 200 and 403 error and \n Error Message:",message, "\nResponse data: ",response_data)
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b,  RESPONSE_PAYLOAD = :d  where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail")
                servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                cur.close()
        except Exception as e:
            print("Error in updating the invoice detail in DB",e)
            servicelogger_error.exception(f"Exception occured while updating data into database for Invoice No: {invoice_id}")
        finally:
            connection.close()

    def persistUpdateEinvStockTransforResponseInDB(response,res_status_code,invoice_id,gstin, token,companyid, request_id, einv_template):
        try: 
            connection = database.getDatabaseConnection()   
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
                
                    response_pdf = apiDetails.getPDFfromEInvIO(iris_id, companyid, token, einv_template)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , IRIS_QRCODE = :3, IRIS_NO = :4, IRIS_ID = :5, IRIS_STATUS = :6 , IRIS_ACK_NO = :7 , IRIS_ACK_DATE = :8 , IRIS_SIGNED_INVOICE = :9 , IRIS_SIGNED_QR_CODE = :10 , IRIS_EWB_NO = :11 , IRIS_EWB_DATE = :12 , IRIS_EWB_VALID_TILL = :13, IRIS_IRN_NO = :14, INVOICE_PDF = :15, USERGSTIN = :16,  RESPONSE_PAYLOAD = :17 where TRX_NUMBER = :18 AND REQUEST_ID = :19"
                    bind_var = [response_status, message, qr_code, iris_no, iris_id, status, ackNo, ackDt, signedInvoice, signedQrCode, EwbNo, EwbDt, EwbValidTill, irn, response_pdf.content, gstin, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    
                    attachment_block = "DECLARE  P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200); BEGIN  P_CONC_REQ_ID := {}; P_DOC_NUM := '{}';  XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC ( P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM); END;".format(request_id, iris_no)                  
                    cur.execute(attachment_block)
                    connection.commit()
                    cur.close()                   
                    servicelogger_info.info(f"Invoice Details updated in table and attachment added for Invoice No: {invoice_id} and Request Id: {request_id}")
                
                else:
                    msg_values = [error["msg"] for error in response_data["errors"]]
                    all_msg_values = ", ".join(msg_values)
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b ,  RESPONSE_PAYLOAD = :d where TRX_NUMBER = :e AND REQUEST_ID = :z"                    
                    bind_var = [response_status, all_msg_values, json_response, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)                    
                    connection.commit()
                    servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                    cur.close()
                               
            elif res_status_code == 403:
                print("Inside status 403")
                message = response_data.get('message')
                failure_status = "FAILURE"           
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                cur.close()
                     
            else:
                message = response_data.get('message')
                failure_status = "FAILURE"
                # print("Inside other than 200 and 403 error and \n Error Message:",message, "\nResponse data: ",response_data)               
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b,  RESPONSE_PAYLOAD = :d  where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_response, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Invoice detail Updated - fail")
                servicelogger_info.info(f"Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                cur.close()
                          
        except Exception as e:
            servicelogger_error.exception(f"Exception Occured in updating table for Stock Transfer Invoice No: {invoice_id}")
        finally:
            connection.close()
            
    # Cancel IRN
    def CancelInvoiceQuery(invoice_id):
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception(f"Exception occured in the invoice detail for cancelling IRN from database for Invoice Id: {invoice_id}")
        finally:
            connection.close()
    
    def persistInsertCancelIrnRequestInDB(payload, invoice_id, invoice_date, created_by, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            json_payload = json.dumps(payload)        
            Insert_Query = "INSERT INTO XX_IRIS_CANCEL_IRN_LOG_T (TRX_NUMBER, TRX_DATE, UPLOAD_TIME, CREATED_BY, CREATION_DATE, REQUEST_ID, REQUEST_PAYLOAD) VALUES ( :1, TO_DATE( :2, 'DD-MM-YYYY'), TO_DATE( :3, 'DD-MM-YYYY'), :4, TO_DATE( :5, 'DD-MM-YYYY'), :6, :7)"            
            bind_var = [invoice_id, invoice_date, date.today().strftime('%d-%m-%Y'), created_by, date.today().strftime('%d-%m-%Y'), request_id, json_payload]
            cur.execute(Insert_Query, bind_var)
            connection.commit()
            print(" Cancel IRN Record inserted successfully")
            servicelogger_info.info(f"Cancel Invoice Detail inserted in table for Invoice No: {invoice_id} and Request Id: {request_id}")
            cur.close()
            
        except Exception as e:
            print("Error in insert the invoice detail in DB for Cancel IRN :",e)
            servicelogger_error.exception(f"Exception Occured in insert the invoice detail in DB for Cancel IRN for Invoice No: {invoice_id} and Request Id: {request_id}")
        finally:
            connection.close()

    def persistUpdateCancelIrnResponseInDB(response_data, res_status_code, invoice_id, request_id, iris_id, companyId, token):
        try:
            connection = database.getDatabaseConnection() 
            cur = connection.cursor()
            json_payload = json.dumps(response_data)
            print("Response : ",json_payload)
            if res_status_code == 200:
                print("Inside status 200")
                # Extract fields from the response and save them to another table
                response_status = response_data.get('status')
                message = response_data.get("message", '')
                if response_status == "SUCCESS" :
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
                    attachment_block = "DECLARE  P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200);  BEGIN  P_CONC_REQ_ID := {}; P_DOC_NUM := '{}';  XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC ( P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM); END;".format( request_id, invoice_id)
                    
                    cur.execute(attachment_block)
                    connection.commit()
                    print("Invoice detail Updated and attachment ")   
                    servicelogger_info.info(f"Cancel Invoice Details updated in table and attachment added for Invoice No: {invoice_id} and Request Id: {request_id}")                   
                    cur.close()
                                 
                else:
                    fail_message = response_data['errors'][0]['msg']
                    print(fail_message)
                    Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                    bind_var = [response_status, fail_message, json_payload, invoice_id, request_id]
                    # cur.execute(Update_Query, {'a': response_status, 'b': fail_message,'c': 'null' ,'e': invoice_id, 'z': request_id})
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    print("Invoice detail Updated - Structural Error")    
                    servicelogger_info.info(f"Cancel Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")             
                    cur.close()
                           
            elif res_status_code == 403:  
                # print("Inside status 403")
                message = response_data.get("message", '')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                servicelogger_info.info(f"Cancel Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                print("Cancel Invoice Updated - fail(403)")
                cur.close()
                                        
            else:
                message = response_data.get("message", '')
                # print("Message in 400: ",message)
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_CANCEL_IRN_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b , RESPONSE_PAYLOAD = :c where TRX_NUMBER = :e AND REQUEST_ID = :z"
                bind_var = [failure_status, message, json_payload, invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                servicelogger_info.info(f"Cancel Invoice Details updated in table for Invoice No: {invoice_id} and Request Id: {request_id}")
                print("Cancel Invoice Updated - fail")
                cur.close()
                     
        except Exception as e:
            servicelogger_error.exception(f"Exception Occured in updating table for cancelling Invoice No: {invoice_id}")
        finally:
            connection.close()

    # E-Way Bill for Non-IRN
    def executeEwbHeaderQuery(document_No):
        try:
            connection = database.getDatabaseConnection()
            print("Inside Header Query for EWB")
            cur = connection.cursor()
            trx_no = document_No.replace("'", "''")
            Header_ewbNonIRN_Query = """SELECT distinct no, supplyType,  
            CASE 
            WHEN subSplyTypewb = 'Job Work' THEN '4' 
            WHEN subSplyTypewb = 'Supply' THEN '1' 
            WHEN subSplyTypewb = 'Import' THEN '2' 
            WHEN subSplyTypewb = 'Export' THEN '3' 
            ELSE subSplyTypewb 
            END subSplyTypewb, 
            ewbDocType, catg, docDate, 
            CASE 
            WHEN trnTyp = 'REG' THEN '1' 
            ELSE trnTyp 
            END trnTyp, 
            sgstin, strdNm, dgstin, dtrdNm, sbnm, sflno, sloc, sstcd, spin, bgstin, btrdNm, togstin, totrdNm, bbnm, bflno, bloc, bpin, bstcd, 
            CASE 
            WHEN transMode = 'ROAD' THEN '1' 
            WHEN transMode = 'Road' THEN '1' 
            WHEN transMode = 'RAIL' THEN '2' 
            WHEN transMode = 'Rail' THEN '2' 
            WHEN transMode = 'AIR' THEN '3' 
            WHEN transMode = 'Air' THEN '3' 
            WHEN transMode = 'SHIP' THEN '4' 
            WHEN transMode = 'Ship' THEN '4' 
            ELSE transMode 
            END transMode, 
            transDist, EWB_transDocDate, transDocNo, transId, transName, vehNo, vehTyp, userGstin 
            FROM XX_ILFS_EINV_INTORG_DATA_V 
            WHERE NO = '{}'""".format(trx_no)
            
            cur.execute(Header_ewbNonIRN_Query)
            rows = cur.fetchall()
            cur.close()
            
            return rows
        except Exception as e:
            print("Error : ",e)
            servicelogger_error.exception(f"Exception Occured in fetch data from table for E-Way Bill Document No: {document_No}")
        finally:
            connection.close()
    
    def executeEwbLineQuery(document_No):
        print("Inside Line Item Query for EWB")
        try:
            connection = database.getDatabaseConnection()
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
            servicelogger_error.exception(f"Exception Occured in fetch Line Item data from table for E-Way Bill Document No: {document_No}")
        finally:
            connection.close()
    
    def persistInsertEWBRequestInDB(payload, doc_no, createdBy, requestId, docDate):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            json_payload = json.dumps(payload)
            print("EWB Insert in table AND \n Document Date: ",docDate)
            Insert_Query = "INSERT INTO XX_IRIS_EINV_LOG_T (TRX_NUMBER,  REQUEST_PAYLOAD, CREATED_BY, CREATION_DATE, REQUEST_ID, TRX_DATE) VALUES (:1, :2, :3, TO_DATE(:4, 'DD-MM-YYYY'), :5, TO_DATE(:6, 'DD-MM-YYYY'))"
            # foramat_insert_query = Insert_Query.format(doc_no, json_payload, createdBy, date.today().strftime('%d-%m-%Y'), requestId)
            bind_var = [doc_no, json_payload, createdBy, date.today().strftime('%d-%m-%Y'), requestId, docDate]
            cur.execute(Insert_Query, bind_var)    
            connection.commit()
            servicelogger_info.info(f"E-Way Bill Details inserted in table for Document No: {doc_no} and Request Id: {requestId}")
            cur.close()
            
        except Exception as e:
            print("Error Occured to Insert EWB Request in DB = ",e)
            servicelogger_error.exception(f"Exception occured to Insert EWB Request in DB:")
        finally:
            connection.close()

    def persistUpdateEWBResponseInDB(response_data, res_status_code, invoice_id, companyid, token, request_id):
        try:
            connection = database.getDatabaseConnection()
            cur = connection.cursor()
            json_payload = json.dumps(response_data)
            print(f"Inside updation of table for Status Code{res_status_code} and \nResponse :{json_payload}")
            if res_status_code == 200:
                print("Inside status 200")
                # Extract fields from the response and save them to another table
                response_status = response_data.get('status')
                message = response_data.get("message", '')
                if response_status == "SUCCESS" :
                    ewbNo = response_data.get('response').get('ewbNo', None)
                    trxdate = response_data.get('response').get('docDate', None)
                    ewbDate = response_data.get('response').get('ewbDate', None)
                    validUpto = response_data.get('response').get('validUpto', None)
                    userGstin = response_data.get('response').get('userGstin', None)
                    uploadTime = response_data.get('response').get('generatedOn', None)
                    last_updateBy = response_data.get('response').get('generatedBy', None)
                    
                    response_pdf = apiDetails.getPDFfromEwbNo(ewbNo,companyid,token)
                
                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a , RESPONSE_MESSAGE = :b , LAST_UPDATED_BY = :c , RESPONSE_PAYLOAD = :d , INVOICE_PDF = :e , IRIS_EWB_NO = :f , IRIS_EWB_DATE = :g, IRIS_EWB_VALID_TILL = :h, USERGSTIN = :i, TRX_DATE = TO_DATE(:j, 'DD-MM-YYYY'), UPLOAD_TIME = TO_DATE(:k, 'DD-MM-YYYY'), LAST_UPDATE_DATE = TO_DATE(:l, 'DD-MM-YYYY') where TRX_NUMBER = :m AND REQUEST_ID = :n"
                    bind_var = [response_status, message, last_updateBy,  json_payload, response_pdf.content, ewbNo, ewbDate, validUpto, userGstin, trxdate, date.today().strftime('%d-%m-%Y'), date.today().strftime('%d-%m-%Y'), invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()

                    print("Cancel Invoice Updated - success")
                    attachment_block = "DECLARE  P_CONC_REQ_ID NUMBER; P_DOC_NUM VARCHAR2(200);  BEGIN  P_CONC_REQ_ID := {}; P_DOC_NUM := '{}';  XX_IRIS_GST_UTILS_PKG.ILFS_FND_ATTACHMENT_PRC ( P_CONC_REQ_ID => P_CONC_REQ_ID, P_DOC_NUM => P_DOC_NUM); END;".format( request_id, invoice_id)
                    
                    cur.execute(attachment_block)
                    connection.commit()
                    servicelogger_info.info(f"E-Way Bill Details updated in table and attachment added for Document No: {invoice_id} and Request Id: {request_id}")
                    print("Invoice detail Updated and attachment ")
                    cur.close()
                        
                else:
                    fieldError = response_data.get("fieldErrors",'')
                    response_fail_status = "Failure"
                    print("Field Error: ",fieldError)
                    if fieldError is not None:
                        msg_values = [error["defaultMessage"] for error in response_data["fieldErrors"]]
                        all_msg_values = ", ".join(msg_values)
                    elif isinstance(response_data.get("response"), dict) and response_data["response"]["ewbErrorList"] :
                        ewb_error_desc_values = [error["ewbErrorDesc"] for error in response_data["response"]["ewbErrorList"]]
                        all_msg_values = ", ".join(ewb_error_desc_values)
                    elif response_data["message"]:
                        all_msg_values = response_data.get("message", "")
                    print("All Update Records\nRESPONSE_STATUS",response_fail_status ,"\nRESPONSE_MESSAGE:",all_msg_values,"\nUPLOAD_TIME:",date.today().strftime('%d-%m-%Y'),"\nLAST_UPDATE_DATE:",date.today().strftime('%d-%m-%Y'),"\nTRX_NUMBER:",invoice_id,"\nREQUEST_ID:",request_id,"\nRESPONSE_PAYLOAD: ",json_payload)

                    Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b, RESPONSE_PAYLOAD = :c, UPLOAD_TIME = TO_DATE(:d, 'DD-MM-YYYY'), LAST_UPDATE_DATE = TO_DATE(:e, 'DD-MM-YYYY') where TRX_NUMBER = :f AND REQUEST_ID = :g"
                    bind_var = [response_fail_status, all_msg_values, json_payload, date.today().strftime('%d-%m-%Y'), date.today().strftime('%d-%m-%Y'), invoice_id, request_id]
                    # Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :a ,RESPONSE_MESSAGE = :b, RESPONSE_PAYLOAD = :c where TRX_NUMBER = :f AND REQUEST_ID = :g"
                    # bind_var = [response_fail_status, all_msg_values, json_payload, invoice_id, request_id]
                    cur.execute(Update_Query, bind_var)
                    connection.commit()
                    servicelogger_info.info(f"E-Way Bill Details updated in table for Document No: {invoice_id} and Request Id: {request_id}")
                    print("Invoice detail Updated - Structural Error")
                    cur.close()
                         
            elif res_status_code == 403:
                # print("Inside status 403")
                message = response_data.get("message", '')
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1, RESPONSE_MESSAGE = :2, RESPONSE_PAYLOAD = :3, LAST_UPDATE_DATE = TO_DATE(:4, 'DD-MM-YYYY') where TRX_NUMBER = :5 AND REQUEST_ID = :6"
                bind_var = [failure_status, message, json_payload, date.today().strftime('%d-%m-%Y'), invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                servicelogger_info.info(f"E-Way Bill Details updated in table for Document No: {invoice_id} and Request Id: {request_id}")
                print("Cancel Invoice Updated - fail(403)")
                cur.close()
                
            else:
                message = response_data.get("message", '')
                # print("Message in 400: ",message)
                failure_status = "FAILURE"
                Update_Query = "UPDATE XX_IRIS_EINV_LOG_T SET RESPONSE_STATUS = :1 ,RESPONSE_MESSAGE = :2 , RESPONSE_PAYLOAD = :3, LAST_UPDATE_DATE = TO_DATE(:4, 'DD-MM-YYYY') where TRX_NUMBER = :5 AND REQUEST_ID = :6"
                bind_var = [failure_status, message, json_payload, date.today().strftime('%d-%m-%Y'), invoice_id, request_id]
                cur.execute(Update_Query, bind_var)
                connection.commit()
                print("Cancel Invoice Updated - fail")
                servicelogger_info.info(f"E-Way Bill Details updated in table for Document No: {invoice_id} and Request Id: {request_id}")
                cur.close()
                
        except Exception as e:
            servicelogger_error.exception(f"Exception Occured in update E-Way Bill for request Id: {request_id}")
        finally:
            connection.close()