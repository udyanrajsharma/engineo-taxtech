



import cx_Oracle

def connect_to_database():
    try:
        # Oracle database connection details
        dsn_tns = cx_Oracle.makedsn('localhost', '1521', sid='orcl')
        conn = cx_Oracle.connect(user='C##neelmani', password='Engineo$%9450', dsn=dsn_tns)
        return conn
    except cx_Oracle.DatabaseError as e:
        print("An error occurred while connecting to the database:", e)
        return None
