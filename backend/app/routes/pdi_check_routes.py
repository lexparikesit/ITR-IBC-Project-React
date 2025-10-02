from flask import Blueprint
from app.controllers.pdi_check_controller import submit_pdi_form # Ganti dengan path file controller Anda

pdi_bp = Blueprint('pdi_bp', __name__, url_prefix='/api/pre-delivery-inspection')

@pdi_bp.route('/<brand>/submit', methods=['POST'])
def submit_pdi(brand):
    """Endpoint for receiving and processing PDI data."""
    
    return submit_pdi_form(brand)