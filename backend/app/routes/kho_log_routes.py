from flask import Blueprint
from app.controllers.auth_controller import jwt_required
from app.controllers.kho_log_controller import get_all_kho_logs

kho_log_bp = Blueprint('kho_log_bp', __name__, url_prefix='/api')

@kho_log_bp.route('/kho-document/log', methods=['GET'])
@jwt_required
def get_kho_logs_route():
    """Get all KHO documents for API Routes."""
    
    return get_all_kho_logs()