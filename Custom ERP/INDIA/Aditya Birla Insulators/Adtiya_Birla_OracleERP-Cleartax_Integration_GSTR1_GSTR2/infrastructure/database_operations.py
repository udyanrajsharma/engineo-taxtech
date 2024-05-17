
import cx_Oracle
import pandas as pd
# from io import BytesIO
# import database_connection 



class database_operations:
#     def fetch_data_from_database(conn):
#         try:
#             # SQL query to fetch data
#             query = 'SELECT * FROM ADITYA_BIRLA_GSTR'
            
#             # Fetch data into a DataFrame using Pandas
#             df = pd.read_sql(query, con=conn)
#             return df
#         except Exception as e:
#             print("An error occurred while fetching data from the database:", e)
#             return None

#     def export_to_excel(df, filename):
#         try:
#             # Convert DataFrame to Excel file in-memory buffer
#             excel_buffer = BytesIO()
#             df.to_excel(excel_buffer, index=True)
#             excel_buffer.seek(0)  # Reset buffer position to start
            
#             with open(filename, 'wb') as f:
#                 f.write(excel_buffer.read())
            
#             print("Excel file created successfully at:", filename)
#             return True
#         except Exception as e:
#             print("An error occurred while exporting to Excel:", e)
#             return False




    def connect_to_database():
        try:
            # Oracle database connection details
            dsn_tns = cx_Oracle.makedsn('localhost', '1521', sid='orcl')
            conn = cx_Oracle.connect(user='C##neelmani', password='Engineo$%9450', dsn=dsn_tns)
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
