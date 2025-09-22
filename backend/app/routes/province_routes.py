from flask import Blueprint
from app.controllers import province_controller

# Create a blueprint for province-related routes
province_bp = Blueprint('province_bp', __name__)

# Route to get all provinces
province_bp.add_url_rule('/api/provinces', view_func=province_controller.get_provinces, methods=['GET'])