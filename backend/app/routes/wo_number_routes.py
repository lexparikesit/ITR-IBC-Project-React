from flask import Blueprint, jsonify
from app.controllers.work_order_controller import get_all_work_orders_data
from app.controllers.auth_controller import jwt_required

wo_number_bp = Blueprint('wo_number_bp', __name__, url_prefix='/api')

@wo_number_bp.route('/work-orders', methods=['GET'])
@jwt_required
def get_work_order_route():
    """ API Routes to get all Work Order """
    
    data, status_code = get_all_work_orders_data()
    
    if status_code == 200:
        return jsonify(data)
    else:
        return jsonify(data), status_code