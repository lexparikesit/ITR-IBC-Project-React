from flask import Blueprint
from app.controllers.checklist_controller import submit_checklist, get_all_checklists_by_brand, get_checklist_by_brand_and_id

checklist_bp = Blueprint('checklist', __name__)

# endpoint to submit checklist based on brand
@checklist_bp.route('/submit', methods=['POST'])
def submit_checklist_route():
    
    return submit_checklist()

# endpoint to get all checklists by brand
@checklist_bp.route('/<string:brand>/all', methods=['GET'])
def get_all_checklists_for_brand(brand):
    
    return get_all_checklists_by_brand(brand)

# Endpoint to get checklist by ID and brand
@checklist_bp.route('/<string:brand>/<uuid:checklist_id>', methods=['GET'])
def get_checklist_for_brand(brand, ac_id):
    
    return get_checklist_by_brand_and_id(brand, ac_id)