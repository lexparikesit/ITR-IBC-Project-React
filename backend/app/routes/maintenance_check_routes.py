from flask import Blueprint, jsonify
from app.controllers import maintenance_check_controller
from app.controllers.auth_controller import jwt_required

# initiate Blueprint
maintenance_api_bp = Blueprint('maintenance_api', __name__, url_prefix='/api/storage-maintenance')

# POST Route for submitting data
@maintenance_api_bp.route('/<brand>/submit', methods=['POST'])
@jwt_required
def submit_checklist_route(brand):
    """Handles the submission of a new maintenance checklist for a given brand."""
    
    return maintenance_check_controller.submit_maintenance_checklist()

# GET Route to retrieve all checklists for a brand
@maintenance_api_bp.route('/<brand>', methods=['GET'])
@jwt_required
def get_all_checklists_route(brand):
    """Retrieves all checklists for a specific brand."""
    
    return maintenance_check_controller.get_all_maintenance_checklists_by_brand(brand)

# GET Route to retrieve a single checklist by ID
@maintenance_api_bp.route('/<brand>/<item_id>', methods=['GET'])
@jwt_required
def get_checklist_by_id_route(brand, item_id):
    """Retrieves a single checklist by its brand and ID."""

    return maintenance_check_controller.get_maintenance_checklist_by_brand_and_id(brand, item_id)