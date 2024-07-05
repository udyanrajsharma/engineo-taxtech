# application/main.py

# from infrastructure.file_oprations import file_operations
from infrastructure.api_operations import api_operations
# -------------------------------------------------------------------------------------------------
from infrastructure.database_operations import database_operations as db_ops
# from infrastructure.database_connection import database_connection as db_conn
import datetime
# Get the current date
current_datetime = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")


class cleartax_GSTR:

    def fileGSTR1():
        FILE_PATH = f"D:/CODE/EngiNeo/engineo-taxtech/Custom ERP/INDIA/Aditya Birla Insulators/Adtiya_Birla_OracleERP-Cleartax_Integration_GSTR1_GSTR2/GSTR1_files/GSTR{current_datetime}.xlsx"


        try:
            # Connect to the database
            conn = db_ops.connect_to_database()
            if conn is None:
                exit(1)

            # Fetch data from the database
            df = db_ops.fetch_data_from_database(conn)
            if df is None:
                exit(1)

            # Print the DataFrame to the console
            print("Data from the database:")
            print(df)  # This line prints both field names and entire data

            
            

            # Define the file path with current date and template type to save the Excel file
            excel_file_path = f"D:/CODE/EngiNeo/engineo-taxtech/Custom ERP/INDIA/Aditya Birla Insulators/Adtiya_Birla_OracleERP-Cleartax_Integration_GSTR1_GSTR2/GSTR1_files/GSTR{current_datetime}.xlsx"

            # Export DataFrame to Excel file
            if db_ops.export_to_excel(df, excel_file_path):
                print("Excel file created successfully!")
            else:
                print("Failed to create Excel file.")

            # Close Oracle connection
            conn.close()

        except Exception as e:
            print("An error occurred:", e)

        
        pre_signed_url = api_operations.get_pre_signed_url(f"GSTR{current_datetime}","XLSX","sales")
        if not pre_signed_url:
            return

        upload_successful = api_operations.upload_file_to_storage(FILE_PATH, pre_signed_url, "XLSX")
        if not upload_successful:
            return

        activity_id = api_operations.trigger_file_ingestion(pre_signed_url, f"GSTR{current_datetime}.xlsx", "sales")
        if not activity_id:
            return

        api_operations.get_file_ingestion_status(activity_id, "sales")

        print("GSTR1 successfull")

# ----------------------------------------------------------------------------------------------------------------
    def fileGSTR2():
        FILE_PATH = f"D:/CODE/EngiNeo/engineo-taxtech/Custom ERP/INDIA/Aditya Birla Insulators/Adtiya_Birla_OracleERP-Cleartax_Integration_GSTR1_GSTR2/GSTR2_file/GSTR{current_datetime}.xlsx"


        try:
            # Connect to the database
            conn = db_ops.connect_to_database()
            if conn is None:
                exit(1)

            # Fetch data from the database
            df = db_ops.fetch_data_from_database(conn)
            if df is None:
                exit(1)

            # Print the DataFrame to the console
            print("Data from the database:")
            print(df)  # This line prints both field names and entire data

            

            # Get the current date
            # current_date = datetime.datetime.now().strftime("%Y-%m-%d")

            # Define the file path with current date and template type to save the Excel file
            excel_file_path = f"D:/CODE/EngiNeo/engineo-taxtech/Custom ERP/INDIA/Aditya Birla Insulators/Adtiya_Birla_OracleERP-Cleartax_Integration_GSTR1_GSTR2/GSTR2_file/GSTR{current_datetime}.xlsx"

            # Export DataFrame to Excel file
            if db_ops.export_to_excel(df, excel_file_path):
                print("Excel file created successfully!")
            else:
                print("Failed to create Excel file.")

            # Close Oracle connection
            conn.close()

        except Exception as e:
            print("An error occurred:", e)

        
        
        pre_signed_url = api_operations.get_pre_signed_url(f"GSTR{current_datetime}", "XLSX", "purchase")
        if not pre_signed_url:
            return

        upload_successful = api_operations.upload_file_to_storage(FILE_PATH, pre_signed_url,"XLSX")
        if not upload_successful:
            return

        activity_id = api_operations.trigger_file_ingestion(pre_signed_url, f"GSTR{current_datetime}.xlsx","purchase")
        if not activity_id:
            return

        api_operations.get_file_ingestion_status(activity_id, "purchase")

        print("GSTR2 sucessfull")


        





























# try:
#     # Connect to the database
#     conn = db_conn.connect_to_database()
#     if conn is None:
#         exit(1)

#     # Fetch data from the database
#     df = db_op.fetch_data_from_database(conn)
#     if df is None:
#         exit(1)

#     # Print the DataFrame to the console
#     print("Data from the database:")
#     print(df)  # This line prints both field names and entire data

#     # Export DataFrame to Excel file
#     excel_filename = 'D:/CLEARTAX/Adtiy Birla/Integrationcode2/infrastructure/xyzsale.xlsx'
#     db_op.export_to_excel(df, excel_filename)

# except Exception as e:
#     print("An error occurred:", e)



























# from infrastructure.api_oprations import api_oprations
# from infrastructure.database_oprations import database_oprations
# from infrastructure.file_oprations import file_operations

# class cleartaxGSTR:   
#     @staticmethod
#     def cleartax_GSTR():
#         return api_oprations.chack_response_api_opration()

#     @staticmethod
#     def cleartax_GSTR1():
#         return database_oprations.chack_response_database_opraions()

#     @staticmethod
#     def cleartax_GSTR2():
#         return file_operations.chack_response_file_oprations()

# if __name__ == "__main__":
#     cleartaxGSTR.cleartax_GSTR()
#     cleartaxGSTR.cleartax_GSTR1()
#     cleartaxGSTR.cleartax_GSTR2()
