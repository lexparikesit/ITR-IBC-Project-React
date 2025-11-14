from flask import Blueprint, request, jsonify
from app.controllers.ibc_controller import create_ibc_form, update_ibc_form

ibc_bp = Blueprint('ibc', __name__, url_prefix='/api/ibc')

@ibc_bp.route('/create-ibc-form', methods=['POST', 'OPTIONS'])
def create_ibc_form_route():
    """ Route to store ALL IBC form data (Header, Details, Accessories, Packages). Also handles preflight OPTIONS requests for CORS. """

    if request.method == 'OPTIONS':
        return jsonify({}), 204
    
    return create_ibc_form()

@ibc_bp.route('/<string:ibc_id>', methods=['PUT', 'OPTIONS'])
def update_ibc_form_route(ibc_id):
    """Route to update an existing IBC form along with its detail rows."""

    if request.method == 'OPTIONS':
        return jsonify({}), 204

    return update_ibc_form(ibc_id)
