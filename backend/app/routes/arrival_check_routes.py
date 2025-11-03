from flask import Blueprint, jsonify
from app.controllers import arrival_check_controller
from app.controllers.auth_controller import jwt_required

arrival_check_bp = Blueprint('arrival_check', __name__)

@arrival_check_bp.route('/<brand>/submit', methods=['POST'])
@jwt_required
def submit_arrival_checklist_route(brand):
    """Routes the submission of an arrival checklist form to the controller. """
    
    return arrival_check_controller.submit_arrival_checklist()

@arrival_check_bp.route('/<brand>', methods=['GET'])
@jwt_required
def get_all_arrival_checklists_route(brand):
    """Routes the request to retrieve all arrival checklists for a brand to the controller."""

    return arrival_check_controller.get_all_arrival_checklists_by_brand(brand)

@arrival_check_bp.route('/<brand>/<uuid:item_id>', methods=['GET'])
@jwt_required
def get_arrival_checklist_by_brand_and_id_route(brand, item_id):
    """Routes the request to retrieve a single arrival checklist by brand and ID to the controller."""
    
    return arrival_check_controller.get_arrival_checklist_by_brand_and_id(brand, item_id)

@arrival_check_bp.route('/check-vin/<string:vin>', methods=['GET'])
@jwt_required
def check_vin_route(vin):
    """Routes the VIN existence check to the controller."""
    
    return arrival_check_controller.check_vin_existence(vin)