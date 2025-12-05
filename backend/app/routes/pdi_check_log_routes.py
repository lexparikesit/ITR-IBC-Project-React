from flask import Blueprint, request
from app.controllers import pdi_check_log_controller as pdilc

pdi_check_log_bp = Blueprint('pre_delivery_log_bp', __name__, url_prefix='/api')

@pdi_check_log_bp.route('/pre-delivery/log/all', methods=['GET', 'OPTIONS'])
def get_all_logs():
    """Routes to get all Pre Delivery Check List (list view)"""
    if request.method == 'OPTIONS':
        return '', 200
    return pdilc.get_all_pdi_checklists()

@pdi_check_log_bp.route('/pre-delivery/log/details/<string:pdi_id>', methods=['GET', 'OPTIONS'])
def get_log_details(pdi_id):
    """Routes to get specific Pre Delivery Check List and items (detail view)."""

    return pdilc.get_preDelivery_details_by_id(pdi_id)
