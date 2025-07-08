from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime
import threading
from app.controllers.auth_controller import AuthController
from app.models.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')
auth_controller = AuthController()

def send_email_with_context(app, email, otp):
    """Helper function to send OTP email within Flask application context"""
    with app.app_context():
        auth_controller.send_otp_email(email, otp)

# Post /api/login
@auth_bp.route('/login', methods=['POST'])
def login():
    
    data = request.json
    user = auth_controller.verify_credentials(data['username'], data['password'])

    if not user:
        return jsonify({"error": "Invalid Credentials!"}), 401

    otp = auth_controller.generate_otp(user.userid)

    # Send OTP email in background thread to avoid blocking the response
    email_thread = threading.Thread(
        target=send_email_with_context, 
        args=(current_app._get_current_object(), user.email, otp)
    )
    email_thread.daemon = True  # Thread will terminate when main program exits
    email_thread.start()
    
    return jsonify({"message": "OTP Sent to Your Email!"}), 200
    
# Post /api/verify-otp
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():

    # print("DEBUG SESSION: ", dict(session))
    
    data = request.json
    user_id = data.get('user_id')
    entered_otp = data.get('otp')

    verified = auth_controller.verify_otp(user_id, entered_otp)

    if not verified:
        return jsonify({"error": "Invalid or Expired OTP!"}), 401
    
    return jsonify({"message": "OTP Verified Successfully!"}), 200

# Post /api/resend-otp
@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    
    email = session.get('email')
    otp_time = session.get('otp_time')

    if not email or not otp_time:
        return jsonify({"error": "Session Expired!"}), 401
    
    now = datetime.now().timestamp()

    if now - otp_time < 60:
        wait_time = int(60 - (now - otp_time))
        return jsonify({"error": f"Please wait {wait_time} seconds before requesting a new OTP."}), 429
    
    otp = auth_controller.generate_otp()
    session['otp'] = otp
    session['otp_time'] = now
    auth_controller.send_otp_email(email, otp)
    return jsonify({"message": "OTP Resent Successfully!"}), 200

# Post /api/register
@auth_bp.route('/register', methods=['POST'])
def register():
    
    data = request.json
    
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"error": "Email already exists!"}), 400
    
    if data['password'] != data['confirmPassword']:
        return jsonify({"error": "Passwords do not match!"}), 400
    
    auth_controller.create_user(data)
    return jsonify({"message": "User registered successfully!"}), 201
