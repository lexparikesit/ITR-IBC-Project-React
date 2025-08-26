from flask import current_app
from app.models.customer_model import get_customers
from sqlalchemy.engine.url import make_url

def get_all_customers_controller():

    try:
        # get the string config from app.config
        sqlalchemy_uri = current_app.config['SQLALCHEMY_DATABASE_URI']

        url = make_url(sqlalchemy_uri)

        connection_string = (
            f"DRIVER={url.query.get('driver')};"
            f"SERVER={url.host};"
            f"DATABASE={url.database};"
            f"UID={url.username};"
            f"PWD={url.password};"
        )

        customers = get_customers(connection_string)

        unique_customers = {}
        for cust in customers:
            if cust['CustomerID'] not in unique_customers:
                unique_customers[cust['CustomerID']] = cust

        final_customers = list(unique_customers.values())

        if not final_customers:
            return {"error": "Failed to retrieve customer data"}, 500
        
        return final_customers, 200
    
    except Exception as e:
        print(f"Error in controllers/customer_controller.py: {e}")
        return {"error": "Internal server error"}, 500