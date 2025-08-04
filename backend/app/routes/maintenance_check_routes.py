from flask import Blueprint, jsonify, request
from app.controllers.maintenance_check_controller import (
    submit_maintenance_checklist,
    get_all_maintenance_checklists_by_brand,
    get_maintenance_checklist_by_brand_and_id
)

# initiate Blueprint
maintenance_api_bp = Blueprint('maintenance_api', __name__, url_prefix='/api/storage-maintenance')

# POST Route for submitting data
@maintenance_api_bp.route('/<brand>/submit', methods=['POST'])
def submit_checklist_route(brand):
    """
    Handles the submission of a new maintenance checklist for a given brand.
    """
    
    return submit_maintenance_checklist()

# GET Route to retrieve all checklists for a brand
@maintenance_api_bp.route('/<brand>', methods=['GET'])
def get_all_checklists_route(brand):
    """
    Retrieves all checklists for a specific brand.
    """
    
    return get_all_maintenance_checklists_by_brand(brand)

# GET Route to retrieve a single checklist by ID
@maintenance_api_bp.route('/<brand>/<item_id>', methods=['GET'])
def get_checklist_by_id_route(brand, item_id):
    """
    Retrieves a single checklist by its brand and ID.
    """

    return get_maintenance_checklist_by_brand_and_id(brand, item_id)