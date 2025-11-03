from flask import Blueprint, request
from app.controllers import arrival_check_log_controller as acc 
from app.controllers.auth_controller import jwt_required

arrival_check_log_bp = Blueprint('arrival_check_log_bp', __name__)

@arrival_check_log_bp.route('/arrival-check/log/all', methods=['GET', 'OPTIONS'])
def get_all_logs():
    """Routes to get all arrival check data (list view)"""
    
    if request.method == 'OPTIONS':
        return '', 200
    return acc.get_all_arrival_checklists()

@arrival_check_log_bp.route('/arrival-check/log/details/<string:arrival_id>', methods=['GET', 'OPTIONS'])
def get_log_details(arrival_id):
    """Routes to get specific arrival check header and items (detail view)"""
    
    if request.method == 'OPTIONS':
        return '', 200
    return acc.get_all_arrival_details_by_id(arrival_id)