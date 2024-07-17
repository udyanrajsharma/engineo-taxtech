import pymssql
import json
import pymssql._mssql
from datetime import datetime
from dotenv import load_dotenv
from decimal import Decimal
import os
import configparser
import base64
import sys
import logging
# from infrastructure.apiDetails import apiDetails

servicelogger_info = logging.getLogger("ClearTaxEWBServiceLogger")
servicelogger_error = logging.getLogger("ClearTaxEWBErrorLogger")

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)  # Convert Decimal to float
    raise TypeError


# INI File
config = configparser.ConfigParser()
extDataDir = os.path.dirname(sys.executable)
config_path = os.path.join(extDataDir,'CLEARTAX_INOX_EWB_NONIRN_PROPERTIES_PROD_SERVER.ini')
config.read(config_path)

def decode_value(encoded_str):
    decoded_bytes = base64.b64decode(encoded_str.encode('utf-8'))
    decoded_str = decoded_bytes.decode('utf-8')
    return decoded_str

DB_NAME = decode_value(config.get('DB_CONNECTION', 'DB_NAME'))
DB_USER = decode_value(config.get('DB_CONNECTION', 'DB_USER'))
DB_PASSWORD = decode_value(config.get('DB_CONNECTION', 'DB_PASSWORD'))
DB_SERVER = decode_value(config.get('DB_CONNECTION', 'DB_SERVER'))

class database:

    def databaseConnection():
        try:
            connection = pymssql.connect(
                server = DB_SERVER,
                user= DB_USER,
                password= DB_PASSWORD,
                database= DB_NAME
            )
            # servicelogger_info.info("database connected")
            return connection
        except Exception as e:
            servicelogger_error.exception("..Exception Occured during Connection with database...\n")

    def executeHeaderDBQuery():
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            Header_query = "select distinct [Document Number], CONVERT(varchar(10), [Document Date],103) [Document Date],  case when [Document Type] = 'Invoice' then 'INV' when [Document Type] = 'Delivery Challan' then 'CHL' when [Document Type] = 'Other' then 'Oth' else [Document Type] end [Document Type], [Transaction Type], case when [Sub Type] = 'jobwork' then 'JOB_WORK' when [Sub Type] = 'supply' then 'Supply' when [Sub Type] = 'Own use' then 'OWN_USE' when [Sub Type] = 'Export' then 'Export' when [Sub Type] = 'SKD' then 'SKD_CKD_LOTS' when [Sub Type] = 'Others' then 'OTH' when [Sub Type] = 'Other' then 'OTH' else [Sub Type] end [Sub Type], [Sub Type Description], case when [Eway Bill Transaction Type] = 'R' then 'Regular' else [Eway Bill Transaction Type] end [Eway Bill Transaction Type], [Customer Billing GSTIN], [Customer Billing Name], [Customer Billing Address], [Customer Billing Address 2], [Customer Billing City], CONVERT(INT, [Customer Billing Pincode]) [Customer Billing Pincode], [Customer Billing State], [Supplier GSTIN], [Supplier Name], [Supplier Address1], [Supplier Address2], [Supplier Place], CONVERT(INT, [Supplier Pincode]) [Supplier Pincode], [Supplier State], [Customer Shipping Name], [Customer Shipping Address], [Customer Shipping Address 2], [Customer Shipping City], CONVERT(INT, [Customer Shipping Pincode]) [Customer Shipping Pincode], [Customer shipping State], [Transporter ID], [Transporter Name], [Transportation Mode (Road/Rail/Air/Ship)], [Distance Level (Km)], [Transporter Doc No], REPLACE([Transportation Date], '-', '/'), [Vehicle Number], [Vehicle Type] from [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] where [ACTIVE] = '0'"         
            cur.execute(Header_query)
            rows = cur.fetchall()
            cur.close()
            servicelogger_info.info("...Data fetch from [EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] table from database for generate E-Way Bill...\n")
            connection.close()
            return rows
        except Exception as e:
            servicelogger_error.exception("Exception Occured in executing the Header Query from database for generate EWB :\n ")
        finally:
            connection.close()

    def executeLineDBQuery(document_No):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            Lineitem_query = 'select [Product Name], [Item Description], [HSN code], CONVERT(DECIMAL(8,2),[Item Quantity]) [Item Quantity] , [Item Unit of Measurement], [Taxable Value], [CGST RATE], [cgst amount], [SGST RATE], [Sgst amount], [IGST RATE], [Igst amount], [CESS Rate], [CESS Amount], [Other Value], [CESS Non Advol Tax Amount] from [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] where [Document Number] = \'{}\''.format(document_No)
            cur.execute(Lineitem_query)
            rows = cur.fetchall()
            cur.close()
            connection.close()
            return rows
        except Exception as e:
            servicelogger_error.exception("Exception Occured in executing the Line Item Query from database for generate EWB :\n ")
        finally:
            connection.close()

    def persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill,DocumentNumber, payload, response_data, gstIn, pdfFileName):
        try:
            connection = database.databaseConnection()
            json_Reqpayload = json.dumps(payload, default=decimal_default)
            json_ResponsePayload = json.dumps(response_data, default=decimal_default)
            cur_2 = connection.cursor()

            # Insert the response data into table
            insert_query = "INSERT INTO [dbo].[EWB_NON_IRN_RESPONSE] ([Ewb_status], [Ewb_Number], [Ewb_Generated_Date], [Ewb_Due_Date], [DOCUMENT_NUMBER], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME], [EWAY_FILE_NAME]) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
            bind_var = [Status, EwbNo, EwbDt, EwbValidTill, DocumentNumber, json_Reqpayload, json_ResponsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S"), pdfFileName]
            cur_2.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] set [ACTIVE] = '1' WHERE [Document Number] = %s"
            cur_2.execute(update_query, (DocumentNumber))
            connection.commit()

            cur_2.close()
            connection.close()
            servicelogger_info.info(f"... Response Records from ClearTax API for generate EWB inserted into [EWB_NON_IRN_RESPONSE] table for Success status for Document No: {DocumentNumber}...\n")
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Success response in database for generate EWB :\n ")
        finally:
            connection.close()

    def persistFailureResponseInDB(fail_status,error_message, error_code, error_source, DocumentNumber, payload, response_data):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            json_requestPayload = json.dumps(payload ,default=decimal_default)
            json_responsePayload = json.dumps(response_data ,default=decimal_default)
            # Insert the response data into another MSSQL table
            insert_query = "INSERT INTO [dbo].[EWB_NON_IRN_RESPONSE] ([Ewb_status], [Error_code], [Error_message], [Error_source], [DOCUMENT_NUMBER], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME]) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            bind_var = [fail_status, error_code, error_message, error_source, DocumentNumber, json_requestPayload, json_responsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] set [ACTIVE] = '2' WHERE [Document Number] = %s"
            cur.execute(update_query, (DocumentNumber))
            connection.commit()

            cur.close() 
            connection.close()
            servicelogger_info.info(f"... Response Records from ClearTax API for generate EWB inserted into [EWB_NON_IRN_RESPONSE] table for Failure status for Document Number : {DocumentNumber}...\n")
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Failure response in database for generate EWB :\n ")
        finally:
            connection.close()

    # Save Exception Generate EWB
    def persistExceptionFailureResponseInDBForEWBNonIrnPayload(failStatus, documentNumber, ErrorMessage):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            insert_query = "INSERT INTO [dbo].[EWB_NON_IRN_RESPONSE] ([Ewb_status], [Error_message], [DOCUMENT_NUMBER], [UPLOAD_TIME]) VALUES (%s, %s, %s, %s)"
            bind_var = [failStatus, ErrorMessage, documentNumber, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] set [ACTIVE] = '2' WHERE [Document Number] = %s"
            cur.execute(update_query, (documentNumber))
            connection.commit()

            servicelogger_info.info(f"... Response Records from ClearTax API for generate EWB inserted into [EWB_NON_IRN_RESPONSE] table for Failure status for Document Number : {documentNumber}...\n")
            cur.close() 
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Exception Failure response in database for generate EWB")
        finally:
            connection.close()

    # Cancel E-way Bill
    def executeCancelEWBHeaderQuery():
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            Header_query = "SELECT [EWAY_BILL_NO], [USER_GSTIN], [CANCELLATION_REASON], [REASON_REMARKS] FROM [dbo].[ICUST_IIL096_C] WHERE [ACTIVE] = '0'"
            cur.execute(Header_query)
            rows = cur.fetchall()
            cur.close()
            servicelogger_info.info("...Data fetch from [ICUST_IIL096_C] table from database for cancel E-Way Bill...\n")
            connection.close()
            return rows
        except Exception as e:
            servicelogger_error.exception("Exception Occured in executing the database Query for cancel EWB :\n ")
        finally:
            connection.close()

    def persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus, cancelEWBpayload, response_data, pdfFileName):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            json_requestPayload = json.dumps(cancelEWBpayload ,default=decimal_default)
            json_responsePayload = json.dumps(response_data ,default=decimal_default)
            active_status = '1'
            # Insert the response data into another MSSQL table
            insert_query = "INSERT INTO [dbo].[CANCEL_RESPONSE_DATA] ([GSTIN], [IRN], [EWB_NO], [EWB_STATUS], [ACTIVE], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME], [EWAY_FILE_NAME]) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
            bind_var = [gstin, irn, ewbNumber, ewbStatus, active_status, json_requestPayload, json_responsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S"), pdfFileName]
            cur.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[ICUST_IIL096_C] set [ACTIVE] = '1' WHERE [EWAY_BILL_NO] = %s"            
            cur.execute(update_query, (ewbNumber))
            connection.commit()

            servicelogger_info.info("... Response Records from ClearTax API for Cancel EWB inserted into [CANCEL_RESPONSE_DATA] table for Success status...\n")
            cur.close()
            connection.close() 
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Success response in database for cancel EWB :\n ")
        finally:
            connection.close()

    def persistCancelEWBFailureResponseInDB(ewbStatus,error_message, cancelEWBpayload, response_data, ewbNo):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            json_requestPayload = json.dumps(cancelEWBpayload ,default=decimal_default)
            json_responsePayload = json.dumps(response_data ,default=decimal_default)
            # Insert the response data into another MSSQL table
            insert_query = "INSERT INTO [dbo].[CANCEL_RESPONSE_DATA] ( [EWB_NO],[EWB_STATUS], [ERROR_MESSAGE], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME]) VALUES ( %s, %s, %s, %s, %s, %s)"
            bind_var = [ewbNo, ewbStatus, error_message, json_requestPayload, json_responsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()
            servicelogger_info.info("... Response Records from ClearTax API for Cancel EWB inserted into [CANCEL_RESPONSE_DATA] table for Failure status...\n")

            update_query = "update [dbo].[ICUST_IIL096_C] set [ACTIVE] = '2' WHERE [EWAY_BILL_NO] = %s"            
            cur.execute(update_query, (ewbNo))
            connection.commit()

            cur.close()
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Failure response in database for cancel EWB :\n ")
        finally:
            connection.close()

    # Save Exception Cancel EWB
    def persistExceptionFailureResponseInDBForCancelEWBpayload(failStatus, ewbNumber, ErrorMessage):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            insert_query = "INSERT INTO [dbo].[CANCEL_RESPONSE_DATA] ([EWB_STATUS], [ERROR_MESSAGE], [EWB_NO], [UPLOAD_TIME]) VALUES (%s, %s, %s, %s)"
            bind_var = [failStatus, ErrorMessage, ewbNumber, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[ICUST_IIL096_C] set [ACTIVE] = '2' WHERE [EWAY_BILL_NO] = %s"
            cur.execute(update_query, (ewbNumber))
            connection.commit()

            servicelogger_info.info(f"... Response Records from ClearTax API for cancel EWB exception in payload inserted into [EWB_NON_IRN_RESPONSE] table for Failure status for EWB Number : {ewbNumber}...\n")
            cur.close() 
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Exception Failure response in database for cancel EWB payload")
        finally:
            connection.close()

    # Update E-Way Bill
    def executeUpdateEWBHeaderQuery():
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            Header_query = "SELECT [EWAY_BILL_NO], [USER_GSTIN], [FROM_PLACE], [From_State],[Reason_Code], [REASON_REMARKS], [Transport_Document_No], [Transport_Document_Date], [Transport_Mode], [Document_No], [DOCUMENT_TYPE], [Document_Date], [Vehicle_Type], [Vehicle_No] FROM [dbo].[ICUST_IIL097_C] WHERE [ACTIVE] = '0'"
            cur.execute(Header_query)
            rows = cur.fetchall()
            cur.close()
            servicelogger_info.info("...Data fetch successfully from [ICUST_IIL097_C] table from database for update E-Way Bill...\n")
            connection.close()
            return rows
        except Exception as e:
            servicelogger_error.exception("\nException Occured in executing the database Query for update EWB :\n ")
        finally:
            connection.close()

    def persistUpdateEWBSuccessResponseInDB(EWB_No, Updated_date, valid_upto, updateEWBpayload, response_data, pdfFileName):
        try:
            connection = database.databaseConnection()
            json_requestPayload = json.dumps(updateEWBpayload ,default=decimal_default)
            json_responsePayload = json.dumps(response_data ,default=decimal_default)
            cur = connection.cursor()
            # Insert the response data into another MSSQL table
            status = "SUCCESS"
            active_status = '1'
            insert_query = "INSERT INTO [dbo].[UPDATE_RESPONSE_DATA] ([EWB_NO], [UPDATED_DATE], [VALID_UPTO], [STATUS], [ACTIVE], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME], [EWAY_FILE_NAME]) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
            bind_var = [EWB_No, Updated_date, valid_upto, status, active_status, json_requestPayload, json_responsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S"), pdfFileName]
            cur.execute(insert_query, bind_var)
            connection.commit()
            
            update_query = "update [dbo].[ICUST_IIL097_C] set [ACTIVE] = '1' WHERE [EWAY_BILL_NO] = %s"
            cur.execute(update_query, (EWB_No))
            connection.commit()
            servicelogger_info.info("... Response Records from ClearTax API for Update EWB inserted into [UPDATE_RESPONSE_DATA] table for Success status...\n")
            cur.close() 
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Success response in database for update EWB :\n ")
        finally:
            connection.close()

    def persistUpdateEWBFailureResponseInDB(error_message, updateEWBpayload, response_data, ewbNo):
        try:
            connection = database.databaseConnection()
            json_requestPayload = json.dumps(updateEWBpayload ,default=decimal_default)
            json_responsePayload = json.dumps(response_data ,default=decimal_default)
            cur = connection.cursor()
            # Insert the response data into another MSSQL table
            status = "FAILURE"
            insert_query = "INSERT INTO [dbo].[UPDATE_RESPONSE_DATA] ( [EWB_NO], [STATUS], [ERROR_MESSAGE], [REQUEST_PAYLOAD], [RESPONSE_PAYLOAD], [UPLOAD_TIME]) VALUES ( %s, %s, %s, %s, %s, %s)"
            bind_var = [ewbNo, status, error_message, json_requestPayload, json_responsePayload, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()
            servicelogger_info.info(f"... Response Records from ClearTax API for Update EWB inserted into [UPDATE_RESPONSE_DATA] table for Failure status of E-Way Bill No: {ewbNo}...\n")
            
            update_query = "update [dbo].[ICUST_IIL097_C] set [ACTIVE] = '2' WHERE [EWAY_BILL_NO] = %s"
            cur.execute(update_query, (ewbNo))
            connection.commit()
            
            cur.close()
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Failure response in database for update EWB :\n ")
        finally:
            connection.close()

    # Save Exception Update EWB
    def persistExceptionFailureResponseInDBForUpdateEWBpayload(failStatus, ewbNumber, ErrorMessage):
        try:
            connection = database.databaseConnection()
            cur = connection.cursor()
            insert_query = "INSERT INTO [dbo].[UPDATE_RESPONSE_DATA] ([STATUS], [ERROR_MESSAGE], [EWB_NO], [UPLOAD_TIME]) VALUES (%s, %s, %s, %s)"
            bind_var = [failStatus, ErrorMessage, ewbNumber, datetime.now().strftime("%m-%d-%Y %H:%M:%S")]
            cur.execute(insert_query, bind_var)
            connection.commit()

            update_query = "update [dbo].[ICUST_IIL097_C] set [ACTIVE] = '2' WHERE [EWAY_BILL_NO] = %s"
            cur.execute(update_query, (ewbNumber))
            connection.commit()

            servicelogger_info.info(f"... Response Records from ClearTax API for update EWB exceptionin payload inserted into [EWB_NON_IRN_RESPONSE] table for Failure status for EWB Number : {ewbNumber}...\n")
            cur.close() 
            connection.close()
        except Exception as e:
            servicelogger_error.exception("Exception Occured for Exception Failure response in database for update EWB payload")
        finally:
            connection.close()
   