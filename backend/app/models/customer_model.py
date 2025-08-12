import pyodbc

def get_customers(connection_string):
    
    customers = []
    cnxn = None

    try:
        cnxn = pyodbc.connect(connection_string)
        cursor = cnxn.cursor()

        query = "SELECT CUSTACCOUNT, SALESNAME FROM IBC_Customer ORDER BY SALESNAME"
        cursor.execute(query)
        rows = cursor.fetchall()

        for row in rows:
            customer = {
                'CustomerID': row.CUSTACCOUNT,
                'CustomerName': row.SALESNAME
            }
            customers.append(customer)

    except Exception as e:
        print(f"Error in models/customer.py: {e}")
        return []
    
    finally:
        if cnxn:
            cnxn.close()
    
    return customers

