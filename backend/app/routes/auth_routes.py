from flask import Blueprint, request, jsonify, make_response, session, current_app, g
from flask_limiter import Limiter
from werkzeug.security import generate_password_hash
from app import db, limiter
from app.models.models import User
from uuid import UUID
from app.controllers.auth_controller import (
    AuthController,
    jwt_required,
    verify_otp_and_login,
    request_otp_for_login,
    register_user,
    auth_controller_instance,
    get_user_permissions,
    get_user_roles,
    require_permission,
    set_auth_cookies,
    clear_auth_cookies,
)
from app.security.csrf import generate_csrf_token
import threading
from flask_limiter.util import get_remote_address

def _email_or_ip_key():
    """Limiter key: prefer email from JSON, fallback to client IP."""
    data = request.get_json(silent=True) or {}
    return data.get('email') or get_remote_address()

def _username_or_ip_key():
    """Limiter key: prefer username from JSON, fallback to client IP."""
    data = request.get_json(silent=True) or {}
    return data.get('username') or get_remote_address()

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

# Post /api/register
@auth_bp.route('/register', methods=['POST'])
@jwt_required
@require_permission("manage_users")
def register():
    """endpoint to register new account"""

    data = request.get_json()

    required_fields = ["username", "firstName", "lastName", "email", "role"]
    
    if not data or not all(key in data for key in required_fields):
        return jsonify({"message": "Missing Required Fields"}), 400
    
    user = register_user(data)

    if user:
        try:
            auth_controller_instance.send_registration_email(user)
            current_app.logger.info(f"User registered successfully: {user.email}. Registration email sent.")
            return jsonify({"message": "User registered successfully, welcome email sent."}), 201
        
        except Exception as e:
            current_app.logger.error(f"User {user.email} created, but failed to send registration email: {e}")
            return jsonify({"message": "User registered successfully, but failed to send welcome email."}), 201
            
    else:
        current_app.logger.warning(f"Registration failed for email: {data.get('email')} or username: {data.get('username')}")
        return jsonify({"message": "Registration failed. User may already exist or role is invalid."}), 409

# Post /api/login
@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per 10 minutes", key_func=_username_or_ip_key)
def login():
    """endpoint for starting login process w/ Username & Password and get_ OTP()"""

    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and Password are required!"}), 400
    
    user = auth_controller_instance.verify_credentials(username, password)

    if not user:
        current_app.logger.warning(f"Invalid credentials for username: {username}")
        return jsonify({"message": "Invalid credentials!"}), 401
    
    # call global request_otp_for_login for generate and send OTP
    if request_otp_for_login(user.email):
        current_app.logger.info(f"OTP sent to {user.email} for login.")
        return jsonify({
            "message": "OTP Sent to Your Email!",
            "email": user.email
        }), 200
    else:
        current_app.logger.error(f"Failed to send OTP for {user.email}.")
        return jsonify({"message": "Failed to send OTP. Please try again."}), 500

# Post /api/login-otp (Verification of OTP and set JWT Cookie)
@auth_bp.route('/login-otp', methods=['POST'])
@limiter.limit("5 per 10 minutes", key_func=_email_or_ip_key)
def login_with_otp():
    """Endpoint for login with OTP. If successfully, it creates JWT and set within cookie HttpOnly"""

    data = request.get_json()
    email = data.get('email')
    otp_code = data.get('otp_code')

    if not email or not otp_code:
        return jsonify({"message": "Email and OTP code are required!"}), 400
    
    # call function global verify_otp_and_login from controller
    user = verify_otp_and_login(email, otp_code)

    if user:
        # if otp successfully verified, create JWT
        access_token, refresh_token, refresh_expires_at = auth_controller_instance.issue_tokens(user)

        response = make_response(jsonify({
            "message": "Login successful!",
            "access_token": access_token,  # included for backward compatibility; use cookie instead
            "user_id": str(user.userid),
            "email": user.email,
            "user": {
                "id": str(user.userid),
                "username": user.username,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
            }
        }), 200)

        set_auth_cookies(response, access_token, refresh_token, refresh_expires_at)
        current_app.logger.info(f"User {user.email} logged in successfully via OTP.")
        return response
    else:
        current_app.logger.warning(f"Invalid OTP login attempt for email: {email}")
        return jsonify({"message": "Invalid OTP or email!"}), 401

# POST /api/refresh (rotate refresh token + issue new access token)
@auth_bp.route('/refresh', methods=['POST'])
def refresh_session():
    """Issue a new access token using the httpOnly refresh_token cookie and rotate refresh token."""

    raw_refresh = request.cookies.get('refresh_token')
    if not raw_refresh:
        response = make_response(jsonify({"message": "Refresh token missing"}), 401)
        return clear_auth_cookies(response)

    rotation = auth_controller_instance.verify_and_rotate_refresh_token(raw_refresh)
    if not rotation:
        response = make_response(jsonify({"message": "Invalid or expired refresh token"}), 401)
        return clear_auth_cookies(response)

    user = rotation["user"]
    access_token = rotation["access_token"]
    refresh_token = rotation["refresh_token"]
    refresh_expires_at = rotation["refresh_expires_at"]

    response = make_response(jsonify({
        "message": "Token refreshed",
        "user": {
            "id": str(user.userid),
            "username": user.username,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
        }
    }), 200)

    set_auth_cookies(response, access_token, refresh_token, refresh_expires_at)
    return response

# POST /api/resend-otp
@auth_bp.route('/resend-otp', methods=['POST'])
@limiter.limit("3 per 10 minutes", key_func=_email_or_ip_key)
def resend_otp():
    """Endpoint to resend OTP. Receive user_id (or email, email recommended for consistency)."""
    
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required!"}), 400
    
    if request_otp_for_login(email):
        current_app.logger.info(f"OTP resent to {email}.")
        return jsonify({"message": "OTP Resent Successfully!"}), 200
    else:
        current_app.logger.error(f"Failed to resend OTP for {email}.")
        return jsonify({"message": "Failed to resend OTP. Please wait or try again."}), 500

# POST /api/forgot-password/request-otp
@auth_bp.route('/forgot-password/request-otp', methods=['POST'])
@limiter.limit("3 per 10 minutes", key_func=_email_or_ip_key)
def forgot_password_request_otp():
    """Endpoint for requesting OTP when the user forgets their password."""
    
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required!"}), 400

    response, status_code = auth_controller_instance.forgot_password_request_otp(email)
    return jsonify(response), status_code

# POST /api/forgot-password/verify-otp
@auth_bp.route('/forgot-password/verify-otp', methods=['POST'])
@limiter.limit("5 per 10 minutes", key_func=_email_or_ip_key)
def forgot_password_verify_otp():
    """Endpoint for verifying OTP when the user forgets their password and receiving a reset token."""
    
    data = request.get_json()
    email = data.get('email')
    otp_code = data.get('otp_code')

    if not email or not otp_code:
        return jsonify({"message": "Email and OTP code are required!"}), 400

    response, status_code = auth_controller_instance.forgot_password_verify_otp(email, otp_code)
    return jsonify(response), status_code

# POST /api/forgot-password/reset
@auth_bp.route('/forgot-password/reset', methods=['POST'])
@limiter.limit("5 per 30 minutes", key_func=_email_or_ip_key)
def forgot_password_reset():
    """Endpoint for resetting password using reset token."""
    
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required!"}), 400

    response, status_code = auth_controller_instance.reset_password(token, new_password)
    return jsonify(response), status_code

# GET /api/user/me
@auth_bp.route('/user/me', methods=['GET'])
@jwt_required
def get_current_user():
    """Endpoint to get the information of the user who is logged in. Requires a valid ‘session_token’ cookie. User information is already available in `g` thanks to the `jwt_required` decorator."""
    
    user = User.query.filter_by(userid=g.user_id).first()
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    permissions = get_user_permissions(g.user_id)
    roles = get_user_roles(g.user_id)

    return jsonify({
        "id": str(user.userid),
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "permissions": permissions,
        "roles": roles
    }), 200

# PATCH /api/user/me
@auth_bp.route('/user/me', methods=['PATCH'])
@jwt_required
def update_user():
    """Endpoint to update current user's profile (first name, last name, username, email, password)."""
    
    data = request.get_json()
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    # Get current user from g
    user = User.query.filter_by(userid=g.user_id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    # Validate password for all updates
    password = data.get('password') or data.get('old_password')
    if not password:
        return jsonify({"message": "Password is required to update profile"}), 400
    
    # Verify password
    from werkzeug.security import check_password_hash
    if not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid password"}), 401
    
    # Update fields if provided
    try:
        updated_fields = []
        
        # First Name
        if 'first_name' in data:
            user.firstName = data['first_name']
            updated_fields.append('first name')
        
        # Last Name
        if 'last_name' in data:
            user.lastName = data['last_name']
            updated_fields.append('last name')
        
        # Username
        if 'username' in data:
            # Check if username already exists
            existing_user = User.query.filter_by(username=data['username']).first()
            
            if existing_user and existing_user.userid != user.userid:
                return jsonify({"message": "Username already exists"}), 409
            
            user.username = data['username']
            updated_fields.append('username')
        
        # Email
        if 'email' in data:
            # Check if email already exists
            existing_user = User.query.filter_by(email=data['email']).first()
            
            if existing_user and existing_user.userid != user.userid:
                return jsonify({"message": "Email already exists"}), 409
            
            user.email = data['email']
            updated_fields.append('email')
        
        # Password
        if 'new_password' in data:
            new_password = data['new_password']
            user.password = generate_password_hash(new_password)
            updated_fields.append('password')
        
        # Commit changes
        db.session.commit()
        
        # Log success
        current_app.logger.info(f"User {user.email} updated profile: {', '.join(updated_fields)}")
        
        return jsonify({
            "message": f"Profile updated successfully: {', '.join(updated_fields)}",
            "user": {
                "id": str(user.userid),
                "username": user.username,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to update user profile: {e}")
        return jsonify({"message": "Failed to update profile. Please try again."}), 500

# POST /api/logout (Endpoint for logout)
@auth_bp.route('/logout', methods=['POST'])
@jwt_required
def logout():
    """Endpoint for user logout by deleting session cookies."""
    
    refresh_cookie = request.cookies.get('refresh_token')
    if refresh_cookie:
        auth_controller_instance.revoke_refresh_token(refresh_cookie)

    response = make_response(jsonify({"message": "Logged out successfully"}), 200)
    clear_auth_cookies(response)

    current_app.logger.info(f"User {g.user_email} logged out.")
    return response

# GET /api/csrf (issue a short-lived CSRF token for client-side header)
@auth_bp.route('/csrf', methods=['GET'])
def get_csrf_token():
    secret = current_app.config.get("CSRF_SECRET")
    if not secret:
        return jsonify({"message": "CSRF not configured"}), 500
    token = generate_csrf_token(secret)
    return jsonify({"csrfToken": token})
