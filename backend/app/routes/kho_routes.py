from flask import Blueprint, jsonify, request
from app.controllers.auth_controller import jwt_required
from app.controllers.kho_controller import submit_kho_document, get_kho_document_pdf

kho_bp = Blueprint('kho_bp', __name__, url_prefix='/api')

@kho_bp.route('/kho-document/submit', methods=['POST'])
@jwt_required
def submit_kho_document_route():
    """API Route to submit KHO document with PDF upload."""
    
    return submit_kho_document()

@kho_bp.route('/kho-document/<kho_id>/pdf', methods=['GET'])
@jwt_required
def get_kho_document_pdf_route(kho_id):
    """API Route to get signed URL for KHO document PDF download."""
    
    return get_kho_document_pdf(kho_id)