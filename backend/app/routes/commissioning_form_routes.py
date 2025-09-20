from flask import Blueprint
from app.controllers.commissioning_controller import (
    submit_commissioning_form
)

# initiate Blueprint with URL prefix
commissioning_bp = Blueprint('commissioning_bp', __name__, url_prefix='/api/commissioning')

# POST Route for submitting data
@commissioning_bp.route('/<brand>/submit', methods=['POST'])
def submit_checklist_route(brand):
    """Handles the submission of a new commissioning form for a given brand."""
    # Pass the 'brand' from the URL to the controller function
    return submit_commissioning_form(brand)