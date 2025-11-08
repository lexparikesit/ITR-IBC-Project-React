from flask import Blueprint, jsonify
from app.controllers.customer_controller import get_all_customers_controller
from app.controllers.auth_controller import jwt_required

customer_bp = Blueprint('customer_bp', __name__, url_prefix='/api')

@customer_bp.route('/customers', methods=['GET'])
@jwt_required
def get_customers_route():
    """ API Routes to get all Customer """
    
    customers, status_code = get_all_customers_controller()
    
    if status_code == 200:
        return jsonify(customers)
    else:
        return jsonify(customers), status_code