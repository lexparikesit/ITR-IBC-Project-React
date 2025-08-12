from flask import Blueprint, jsonify, request
from app.controllers.accessories_controller import get_all_accesories, create_accesory 

mst_accessories_bp = Blueprint('mst_accessories_bp', __name__, url_prefix='/api')

@mst_accessories_bp.route('/mstAccesories', methods=['GET'])
def get_all_accessories_route():
    """API Route to get all Accessories.Create new accessories data."""
    
    accessories_data, status_code = get_all_accesories()
    return jsonify(accessories_data), status_code

@mst_accessories_bp.route('/mstAccesories', methods=['POST'])
def create_accessory_route():
    """API Route to create new Accessories."""

    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400

    new_accessory_data, status_code = create_accesory(data)
    
    return jsonify(new_accessory_data), status_code