from flask import Blueprint
from app.controllers.ibc_controller import generate_ibc_number_and_save_header, update_ibc_form

ibc_bp = Blueprint('ibc', __name__, url_prefix='/api/ibc')

@ibc_bp.route('/generate-ibc-number', methods=['POST'])
def generate_ibc_number_route():
    """Route to generate an IBC number and save header data."""
    
    return generate_ibc_number_and_save_header()

@ibc_bp.route('/update-ibc-form', methods=['PUT'])
def update_ibc_form_route():
    """Route to update the IBC form data (details, accessories, packages)."""
    
    return update_ibc_form()