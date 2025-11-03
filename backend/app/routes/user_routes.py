from flask import Blueprint, jsonify, request
from app.controllers.auth_controller import jwt_required, require_permission
from app.models.models import User, IBCRoles, IBCUserRoles
from app import db

user_bp = Blueprint('user', __name__, url_prefix='/api')

# GET /api/users
@user_bp.route('/users', methods=["GET"])
@jwt_required
@require_permission('manage_users')
def get_all_users():
    """get all users"""
    
    try:
        users = User.query.all()
        result = []

        for user in users:
            roles = db.session.query(IBCRoles.role_name)\
            .join(IBCUserRoles, IBCRoles.role_id == IBCUserRoles.role_id)\
            .filter(IBCUserRoles.userid == user.userid)\
            .all()

            result.append({
                "id": str(user.userid),
                "username": user.username,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "roles": [r.role_name for r in roles],
                "is_active": user.is_active
            })

        return jsonify(result), 200

    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"message": "Failed to fetch users"}), 500
    
@user_bp.route('/users/<string:user_id>/toggle-active', methods=['PATCH'])
@jwt_required
@require_permission("manage_users")
def toggle_user_active(user_id):
    """to deactivate user account"""
    
    try:
        user = User.query.filter_by(userid=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Toggle status
        user.is_active = not user.is_active
        db.session.commit()

        status = "activated" if user.is_active else "deactivated"
        return jsonify({"message": f"User {status} successfully"}), 200

    except Exception as e:
        print(f"Error toggling user status: {e}")
        db.session.rollback()
        return jsonify({"message": "Failed to update status"}), 500
    
# GET /api/roles
@user_bp.route('/roles', methods=['GET'])
@jwt_required
@require_permission("manage_users")
def get_all_roles():
    """gett all roles"""
    
    try:
        roles = IBCRoles.query.all()
        return jsonify([{"name": role.role_name} for role in roles]), 200
    
    except Exception as e:
        print(f"Error fetching roles: {e}")
        return jsonify({"message": "Failed to fetch roles"}), 500
    
@user_bp.route('/users/<string:user_id>/assign-roles', methods=['POST'])
@jwt_required
@require_permission("manage_users")
def assign_roles(user_id):
    """assign roles for users"""

    try:
        data = request.get_json()
        role_names = data.get('roles_names')

        if not role_names or not isinstance(role_names, list):
            return jsonify({"message": "roles_names is required and must be a list"}), 400

        # find user
        user = User.query.filter_by(userid=user_id).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # delete all user roles
        IBCUserRoles.query.filter_by(userid=user.userid).delete()

        # assign new roles
        for role_name in role_names:
            role = IBCRoles.query.filter_by(role_name=role_name).first()
            
            if not role:
                return jsonify({"message": f"Role '{role_name}' not found"}), 400
            db.session.add(IBCUserRoles(userid=user.userid, role_id=role.role_id))

        db.session.commit()
        return jsonify({"message": "Roles updated successfully"}), 200

    except Exception as e:
        print(f"Error assigning roles: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

@user_bp.route('/users/by-role/<role_name>', methods=['GET'])
@jwt_required
def get_users_by_role(role_name):
    """Get list of user by role name"""

    try:
        role = IBCRoles.query.filter_by(role_name=role_name).first()

        if not role:
            return jsonify({"message":f"Role '{role_name}' not Found"}), 404

        users = db.session.query(User)\
            .join(IBCUserRoles, User.userid == IBCUserRoles.userid)\
            .filter(IBCUserRoles.role_id == role.role_id)\
            .filter(User.is_active == True)\
            .all()
        
        user_list = [
            {
                "value": str(user.userid),
                "label": f"{user.firstName} {user.lastName}".strip() or user.username
            }
            for user in users
        ]

        return jsonify(user_list), 200

    except Exception as e:
        return jsonify({"message": "Internal server error"}), 500