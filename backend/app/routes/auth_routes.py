from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
from app.controllers.auth_controller import AuthController
from app.models.user_model import User
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    current_user
)
from uuid import UUID
import threading

auth_bp = Blueprint("auth", __name__, url_prefix="/api")
auth_controller = AuthController()


def send_email_with_context(app, email, otp):
    """Helper function to send OTP email within Flask application context"""
    with app.app_context():
        auth_controller.send_otp_email(email, otp)


# Post /api/login
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.json
    user = auth_controller.verify_credentials(data["username"], data["password"])

    if not user:
        return jsonify({"error": "Invalid Credentials!"}), 401

    otp = auth_controller.generate_otp(user.userid)

    # Send OTP email in background thread to avoid blocking the response
    email_thread = threading.Thread(
        target=send_email_with_context,
        args=(current_app._get_current_object(), user.email, otp),
    )
    email_thread.daemon = True  # Thread will terminate when main program exits
    email_thread.start()

    return (
        jsonify({"message": "OTP Sent to Your Email!", "user_id": str(user.userid)}),
        200,
    )


# Post /api/verify-otp
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():

    # print("DEBUG SESSION: ", dict(session))

    data = request.json
    user_id = data.get("user_id")
    entered_otp = data.get("otp")

    if not user_id or not entered_otp:
        return jsonify({"error": "Missing user_id or OTP!"}), 400

    try:
        user_id_uuid = UUID(user_id)

    except ValueError:
        return jsonify({"error": "Invalid user ID format!"}), 400

    verified = auth_controller.verify_otp(user_id_uuid, entered_otp)

    if not verified:
        return jsonify({"error": "Invalid or Expired OTP!"}), 401

    found_user = auth_controller.get_user_by_id(user_id_uuid)

    if not found_user:
        return jsonify({"error": "User not found!"}), 404

    access_token = create_access_token(
        identity=str(found_user.userid),
        additional_claims={
            "username": found_user.username,
            "email": found_user.email,
        },
    )

    refresh_token = create_refresh_token(
        identity=str(found_user.userid),
    )

    return (
        jsonify(
            {
                "message": "OTP Verified Successfully!",
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        ),
        200,
    )


# Post /api/resend-otp
@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():

    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "Missing user ID!"}), 401

    try:
        user_id = UUID(user_id)

    except ValueError:
        return jsonify({"error": "Invalid user ID format!"}), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found!"}), 404

    last_otp = auth_controller.get_last_otp_time(user_id)

    if last_otp and (datetime.now() - last_otp).total_seconds() < 60:
        wait_time = int(60 - (datetime.now() - last_otp).total_seconds())
        return (
            jsonify(
                {
                    "error": f"Please wait {wait_time} seconds before requesting a new OTP."
                }
            ),
            429,
        )

    # Generate OTP baru dan simpan ke database
    otp = auth_controller.generate_otp(user.userid)

    # send emaill
    email_thread = threading.Thread(
        target=send_email_with_context,
        args=(current_app._get_current_object(), user.email, otp),
    )
    email_thread.daemon = True
    email_thread.start()

    return jsonify({"message": "OTP Resent Successfully!"}), 200


# Post /api/register
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.json

    if User.query.filter(
        (User.username == data["username"]) | (User.email == data["email"])
    ).first():
        return jsonify({"error": "Email already exists!"}), 400

    if data["password"] != data["confirmPassword"]:
        return jsonify({"error": "Passwords do not match!"}), 400

    auth_controller.create_user(data)
    return jsonify({"message": "User registered successfully!"}), 201


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_authenticated_user():
    if not current_user:
        return jsonify({"error": "User not found!"}), 404

    return (
        jsonify(
            {
                "message": "Hello, this is your authenticated user!",
                "user": {
                    "username": current_user.username,
                    "email": current_user.email,
                    "first_name": current_user.firstName,
                },
            }
        ),
        200,
    )


# Post /api/auth/refresh
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Generate a new access token from a refresh token"""
    current_user_id = get_jwt_identity()

    # Verify user still exists
    user = auth_controller.get_user_by_id(current_user_id)
    if not user:
        return jsonify({"error": "User not found!"}), 404

    new_access_token = create_access_token(
        identity=str(user.userid),
        additional_claims={
            "username": user.username,
            "email": user.email,
        },
    )

    return (
        jsonify(
            {
                "message": "Token refreshed successfully!",
                "access_token": new_access_token,
            }
        ),
        200,
    )


# Post /api/auth/logout
@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Logout endpoint - in a production app, you'd want to blacklist the token"""
    return jsonify({"message": "Successfully logged out!"}), 200
