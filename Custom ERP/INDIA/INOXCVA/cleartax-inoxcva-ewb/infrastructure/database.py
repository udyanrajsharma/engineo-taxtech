import pymssql
import json
import pymssql._mssql

# MSSQL connection parameters
DB_NAME = "INOX"
DB_NAME_TEST = "INOX_Testing"
DB_USER = "ENGINEOLAPTOP00\\animesha_engineosol"
DB_PASSWORD = 'Ani@8931094967'
DB_SERVER = "ENGINEOLAPTOP00"

# Connect to MSSQL
connection = pymssql.connect(
    server = DB_SERVER,
    user= DB_USER,
    password= DB_PASSWORD,
    database= DB_NAME
)
connection_2 = pymssql.connect(
    server = DB_SERVER,
    user= DB_USER,
    password= DB_PASSWORD,
    database= DB_NAME_TEST
)

class database:

    def executeHeaderDBQuery():
        cur = connection.cursor()
        Header_query = "select distinct [Document Number], CONVERT(varchar(10), [Document Date],101) [Document Date],  case when [Document Type] = 'Invoice' then 'INV' when [Document Type] = 'Delivery Challan' then 'CHL' when [Document Type] = 'Other' then 'Oth' else [Document Type] end [Document Type], [Transaction Type], case when [Sub Type] = 'jobwork' then 'JOB_WORK' when [Sub Type] = 'supply' then 'Supply' when [Sub Type] = 'Own use' then 'OWN_USE' when [Sub Type] = 'Export' then 'Export' when [Sub Type] = 'SKD' then 'SKD_CKD_LOTS' when [Sub Type] = 'Others' then 'OTH' when [Sub Type] = 'Other' then 'OTH' else [Sub Type] end [Sub Type], [Sub Type Description], case when [Eway Bill Transaction Type] = 'R' then 'Regular' else [Eway Bill Transaction Type] end [Eway Bill Transaction Type], [Customer Billing GSTIN], [Customer Billing Name], [Customer Billing Address], [Customer Billing Address 2], [Customer Billing City], CONVERT(INT, [Customer Billing Pincode]) [Customer Billing Pincode], [Customer Billing State], [Supplier GSTIN], [Supplier Name], [Supplier Address1], [Supplier Address2], [Supplier Place], CONVERT(INT, [Supplier Pincode]) [Supplier Pincode], [Supplier State], [Customer Shipping Name], [Customer Shipping Address], [Customer Shipping Address 2], [Customer Shipping City], CONVERT(INT, [Customer Shipping Pincode]) [Customer Shipping Pincode], [Customer shipping State], [Transporter ID], [Transporter Name], [Transportation Mode (Road/Rail/Air/Ship)], [Distance Level (Km)], [Transporter Doc No], REPLACE([Transportation Date], '-', '/'), [Vehicle Number], [Vehicle Type] from [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] where [SUB TYPE] = 'Supply'AND [DOCUMENT DATE] = '04/22/2024' AND [ACTIVE] = '0'"
        cur.execute(Header_query)
        rows = cur.fetchall()
        cur.close()
        return rows

    def executeLineDBQuery(document_No):
        cur = connection.cursor()
        Lineitem_query = 'select [Product Name], [Item Description], [HSN code], CONVERT(DECIMAL(8,2),[Item Quantity]) [Item Quantity] , [Item Unit of Measurement], [Taxable Value], [CGST RATE], [cgst amount], [SGST RATE], [Sgst amount], [IGST RATE], [Igst amount], [CESS Rate], [CESS Amount], [Other Value], [CESS Non Advol Tax Amount] from [dbo].[EWAY_BILL_FORMAT_FIDR1376_FOR_EWAY_PURPOSE] where [Document Number] = \'{}\''.format(document_No)
        cur.execute(Lineitem_query)
        rows = cur.fetchall()
        cur.close()
        return rows

    def persistSuccessResponseInDB(Status,EwbNo,EwbDt,EwbValidTill):
        cur = connection_2.cursor()
        print("Inside Success Resonse for EWB and connection with database")
        # Insert the response data into another MSSQL table
        insert_query = "INSERT INTO [dbo].[RESPONSE_DATA] ([STATUS], [EWB No], [EWB DATE], [EWB Valid Till], [TRANSACTION TYPE], [SUB TYPE], [DOCUMENT TYPE], [DOCUMENT NUMBER]) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        cur.execute(insert_query, (Status, EwbNo, EwbDt, EwbValidTill, "DUMMY", "DUMMY", "DUMMY", "DUMMY"))
        connection_2.commit()
        print("Insert Query completed for success response")
        cur.close() 

    def persistFailureResponseInDB(fail_status,error_message):
        cur = connection_2.cursor()
        print("Inside Failure Resonse for EWB")
        # Insert the response data into another MSSQL table
        insert_query = "INSERT INTO [dbo].[RESPONSE_DATA] ([STATUS], [ERROR MESSAGE], [TRANSACTION TYPE], [SUB TYPE], [DOCUMENT TYPE], [DOCUMENT NUMBER]) VALUES (%s, %s, %s, %s, %s, %s)"
        cur.execute(insert_query, (fail_status, error_message, "DUMMY", "DUMMY", "DUMMY", "DUMMY"))
        connection_2.commit()
        print("Insert Query completed for failure response")
        cur.close() 

    # Cancel E-way Bill
    def executeCancelEWBHeaderQuery():
        cur = connection.cursor()
        Header_query = "SELECT [EWAY_BILL_NO], [USER_GSTIN], [CANCELLATION_REASON], [REASON_REMARKS] FROM [dbo].[ICUST_IIL096_C] WHERE [ACTIVE] = '0'"
        cur.execute(Header_query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def persistCancelEWBSuccessResponseInDB(gstin,irn,ewbNumber,ewbStatus):
        cur = connection.cursor()
        active_status = '1'
        # Insert the response data into another MSSQL table
        insert_query = "INSERT INTO [dbo].[CANCEL_RESPONSE_DATA] ([GSTIN], [IRN], [EWB_NO], [EWB_STATUS], [ACTIVE]) VALUES (%s, %s, %s, %s, %s)"
        cur.execute(insert_query, (gstin, irn, ewbNumber, ewbStatus, active_status))
        connection.commit()
        cur.close() 

    def persistCancelEWBFailureResponseInDB(gstin,irn,ewbNumber,ewbStatus,error_message):
        cur = connection.cursor()
        # Insert the response data into another MSSQL table
        insert_query = "INSERT INTO [dbo].[CANCEL_RESPONSE_DATA] ([GSTIN], [IRN], [EWB_NO], [EWB_STATUS], [ERROR_MESSAGE]) VALUES (%s, %s, %s, %s, %s)"
        cur.execute(insert_query, (gstin,irn,ewbNumber,ewbStatus,error_message))
        connection.commit()
        cur.close()
    
    # Update E-Way Bill
    def executeUpdateEWBHeaderQuery():
        cur = connection.cursor()
        Header_query = "SELECT [EWAY_BILL_NO], [USER_GSTIN], [FROM_PLACE], [From_State],[Reason_Code], [REASON_REMARKS], [Transport_Document_No], [Transport_Document_Date], [Transport_Mode], [Document_No], [DOCUMENT_TYPE], [Document_Date], [Vehicle_Type], [Vehicle_No] FROM [dbo].[ICUST_IIL097_C] WHERE [ACTIVE] = '0'"
        cur.execute(Header_query)
        rows = cur.fetchall()
        cur.close()
        return rows
    
    def persistUpdateEWBSuccessResponseInDB(EWB_No,Updated_date,valid_upto):
        cur = connection.cursor()
        # Insert the response data into another MSSQL table
        status = "SUCCESS"
        active_status = '1'
        insert_query = "INSERT INTO [dbo].[UPDATE_RESPONSE_DATA] ([EWB_NO], [UPDATED_DATE], [VALID_UPTO], [STATUS], [ACTIVE]) VALUES (%s, %s, %s, %s, %s)"
        cur.execute(insert_query, (EWB_No, Updated_date, valid_upto, status, active_status))
        connection.commit()
        cur.close() 

    def persistUpdateEWBFailureResponseInDB(error_message ):
        cur = connection.cursor()
        # Insert the response data into another MSSQL table
        status = "FAILURE"
        insert_query = "INSERT INTO [dbo].[UPDATE_RESPONSE_DATA] ( [STATUS], [ERROR_MESSAGE]) VALUES ( %s, %s)"
        cur.execute(insert_query, ( status, error_message))
        connection.commit()
        cur.close()
   