from flask import Blueprint
from app.controllers import commissioning_log_controller as clc

commissioning_log_bp = Blueprint('commissioning_log_bp', __name__)

@commissioning_log_bp.route('/commissioning/log/all', methods=['GET'])
def get_all_logs():
    """Routes to get all Commissioning List (list view)"""

    return clc.get_all_commissioning_logs()

@commissioning_log_bp.route('/commissioning/log/details/<string:comm_id>', methods=['GET', 'OPTIONS'])
def get_log_details(comm_id):
    """Routes to get specific commissioning header and items (detail view)."""

    return clc.get_commissioning_details_by_id(comm_id)