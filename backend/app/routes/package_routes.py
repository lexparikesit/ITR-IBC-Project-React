from flask import Blueprint, jsonify, request
from app.controllers.auth_controller import jwt_required
from app.controllers.pacakage_controller import get_all_packages, create_package

mst_packages_bp = Blueprint('mst_packages_bp', __name__, url_prefix='/api')

@mst_packages_bp.route('/mstPackages', methods=['GET'])
@jwt_required
def get_all_packages_route():
    """API Route to get all Packages."""

    packages_data, status_code = get_all_packages()
    
    return jsonify(packages_data), status_code

@mst_packages_bp.route('/mstPackages', methods=['POST'])
@jwt_required
def create_package_route():
    """API Route to create a new Package."""
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "Request body must be JSON"}), 400

    new_package_data, status_code = create_package(data)
    return jsonify(new_package_data), status_code