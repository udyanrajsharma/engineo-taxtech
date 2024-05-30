
import cx_Oracle
import pandas as pd
# from io import BytesIO
import os
from dotenv import load_dotenv
# Load variables from .env file
load_dotenv()

DB_user = os.getenv("db_user")
db_password = os.getenv("db_password")
db_host = os.getenv("db_host")
db_port = os.getenv("db_port")
db_sid = os.getenv("db_sid")

class database_operations:


    # def connect_to_database():
    #     try:
    #         # Oracle database connection details
    #         dsn_tns = cx_Oracle.makedsn('localhost', '1521', sid='orcl')
    #         conn = cx_Oracle.connect(user='C##neelmani', password='Engineo$%9450', dsn=dsn_tns)
    #         return conn
    #     except cx_Oracle.DatabaseError as e:
    #         print("An error occurred while connecting to the database:", e)
    #         return None
    def connect_to_database():
        try:
            # Oracle database connection details
            dsn_tns = cx_Oracle.makedsn(db_host, db_port, sid= db_sid)
            conn = cx_Oracle.connect(user= DB_user, password= db_password, dsn=dsn_tns)
            return conn
        except cx_Oracle.DatabaseError as e:
            print("An error occurred while connecting to the database:", e)
            return None

    def fetch_data_from_database(conn):
        try:
            # SQL query to fetch data
            query = 'SELECT * FROM ADITYA_BIRLA_GSTR'
            
            # Fetch data into a DataFrame using Pandas
            df = pd.read_sql(query, con=conn)
            return df
        except Exception as e:
            print("An error occurred while fetching data from the database:", e)
            return None

    def export_to_excel(df, filename):
        try:
            # Save DataFrame to Excel file
            df.to_excel(filename, index=True)
            print("Excel file created successfully at:", filename)
            return True
        except Exception as e:
            print("An error occurred while exporting to Excel:", e)
            return False
