from flask import Blueprint, request
from app.controllers import ibc_log_controller as ibc_log

ibc_log_bp = Blueprint('ibc_log_bp', __name__, url_prefix='/api')

@ibc_log_bp.route('/ibc/log/all', methods=['GET', 'OPTIONS'])
def get_all_logs():
    """Routes to get all ibc log"""
    if request.method == 'OPTIONS':
        return '', 200
    return ibc_log.get_all_ibc()

@ibc_log_bp.route('/ibc/log/details/<string:ibc_id>', methods=['GET', 'OPTIONS'])
def get_log_details(ibc_id):
    """Routes to get specific IBC header and items"""

    return ibc_log.get_ibc_by_id(ibc_id)
