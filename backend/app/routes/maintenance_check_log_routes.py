from flask import Blueprint, request
from app.controllers import maintenance_check_log_controller as smlc
from app.controllers.auth_controller import jwt_required

storage_maintenance_log_bp = Blueprint('storage_maintenance_log_bp', __name__, url_prefix='/api')

@storage_maintenance_log_bp.route('/storage-maintenance/log/all', methods=['GET', 'OPTIONS'])
@jwt_required
def get_all_logs():
    """Routes to get all Storage Maintenance List (list view)"""
    
    if request.method == 'OPTIONS':
        return '', 200
    return smlc.get_all_maintenance_checklists()

@storage_maintenance_log_bp.route('/storage-maintenance/log/details/<string:sm_id>', methods=['GET', 'OPTIONS'])
@jwt_required
def get_log_details(sm_id):
    """Routes to get specific storage maintenance header and items (detail view)."""

    return smlc.get_storage_maintenance_details_by_id(sm_id)
