from flask import Blueprint
from app.controllers.commissioning_controller import (submit_commissioning_form)
from app.controllers.auth_controller import jwt_required

# initiate Blueprint with URL prefix
commissioning_bp = Blueprint('commissioning_bp', __name__, url_prefix='/api/commissioning')

# POST Route for submitting data
@commissioning_bp.route('/<brand>/submit', methods=['POST'])
@jwt_required
def submit_checklist_route(brand):
    """Handles the submission of a new commissioning form for a given brand."""
    
    return submit_commissioning_form(brand)
