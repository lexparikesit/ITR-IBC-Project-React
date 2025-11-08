from flask import Blueprint
from app.controllers import pdi_check_controller
from app.controllers.auth_controller import jwt_required

pdi_bp = Blueprint('pdi_bp', __name__, url_prefix='/api/pre-delivery-inspection')

@pdi_bp.route('/<brand>/submit', methods=['POST'])
@jwt_required
def submit_pdi(brand):
    """Endpoint for receiving and processing PDI data."""
    
    return pdi_check_controller.submit_pdi_form(brand)