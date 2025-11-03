from flask import Blueprint
from app.controllers.unit_type_controller import get_unit_types_by_brand, get_all_brands
from app.controllers.auth_controller import jwt_required

unit_type_bp = Blueprint('unit_type_bp', __name__)

@unit_type_bp.route('/<string:brand_id>', methods=['GET'])
@jwt_required
def get_unit_types_route(brand_id):
    
    return get_unit_types_by_brand(brand_id)

@unit_type_bp.route('/brands', methods=['GET'])
@jwt_required
def get_all_brands_route():
    return get_all_brands()