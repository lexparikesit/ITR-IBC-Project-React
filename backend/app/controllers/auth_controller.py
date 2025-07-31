from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import db, User, UserOtp
from app.service.email_service import EmailService
from datetime import timedelta
from functools import wraps
from flask import request, jsonify, current_app, g
import random
import string
import datetime
import jwt
import os

# configure the JWT
FLASK_JWT_SECRET_KEY = os.environ.get("FLASK_JWT_SECRET_KEY")

if not FLASK_JWT_SECRET_KEY:
    raise ValueError("Error: FLASK_JWT_SECRET_KEY environment Variable not set. "
                    "Please set a strong secret key for JWT in your .env file or server environment")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

def generate_jwt_token(user_id, email, name):
    
    """The token payload contains user_id, email, name, expiry time (exp), and issue time (iat)."""
    payload = {
        'user_id': str(user_id),
        'email': email,
        'name': name,
        'exp': datetime.datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS),
        'iat': datetime.datetime.utcnow()
    }
    token = jwt.encode(payload, FLASK_JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token):
    
    """
    Verifies the JWT token and returns its payload if valid.
    Returns None if the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, FLASK_JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        current_app.logger.warning("JWT Token Has Expired")
        return None
    except jwt.InvalidTokenError:
        current_app.logger.warning("JWT Token is Invalid")
        return None

def jwt_required(f):

    """
    Decorator to protect the API route, requires a valid JWT token
    to be present in the HttpOnly 'session_token' cookie.
    Authenticated user information will be stored in `g` (global request context).
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):

        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"message": "Authentication token is missing!"}), 401
        
        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"message": "Token format invalid (Expected 'Bearer <token>')!"}), 401

        # verify token:
        payload = verify_jwt_token(token)

        if not payload:
            return jsonify({"message": "Token is invalid or expired!"}), 401
        
        # save information from payload to object G
        g.user_id = payload.get('user_id')
        g.user_email = payload.get('email')
        g.user_name = payload.get('name')

        return f(*args, **kwargs)
    return decorated_function

class AuthController:
    def __init__(self):

        self.email_service = EmailService()

    def verify_credentials(self, username, password):

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            return user
        return None

    def generate_otp(self, user_id, length=6):

        # Delete unused or expired OTP for this user
        UserOtp.query.filter_by(user_id=user_id, used_at=None).delete()
        db.session.commit()

        otp_code = "".join(random.choices(string.digits, k=length))
        user_otp = UserOtp (
            user_id=user_id,
            otp_code=otp_code,
            expired_at=datetime.datetime.now() + datetime.timedelta(minutes=5),
            created_at=datetime.datetime.now(),
        )
        db.session.add(user_otp)
        db.session.commit()
        return otp_code
        
    def verify_otp(self, user_id, otp_code):
        
        user_otp = UserOtp.query.filter_by(
            user_id = user_id,
            otp_code = otp_code,
            used_at = None
        ).filter(
            UserOtp.expired_at > datetime.datetime.now()
        ).first()

        if not user_otp:
            return False
        
        # remarks OTP which is used
        user_otp.used_at = datetime.datetime.now()
        db.session.commit()
        return True

    def send_otp_email(self, email, otp):

        subject = "Your OTP Code for ITR IBC Web Apps"
        body = f"Hello,\n\nYour One-Time Password (OTP) for login is: {otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.\n\nRegards,\nITR IBC Team"
        self.email_service.send_email(email, subject, body)

    def create_user(self, data):

        existing_user = User.query.filter_by(email=data["email"]).first()
        existing_user_by_username = User.query.filter_by(username=data["username"]).first()
        
        if existing_user:
            return None
        if existing_user_by_username:
            return None
        
        hashed_password = generate_password_hash(data["password"])

        user = User(
            username=data["username"],
            firstName=data["firstName"],
            lastName=data["lastName"],
            email=data["email"],
            password=hashed_password,
        )

        db.session.add(user)
        db.session.commit()

        return user

auth_controller_instance = AuthController()

def register_user(data):

    """Wrapper untuk AuthController.create_user"""
    return auth_controller_instance.create_user(data)

def request_otp_for_login(email):

    """Manage OTP requests for login. Search for users, generate OTP, and send it via email."""
    user = User.query.filter_by(email=email).first()

    if not user:
        current_app.logger.warning(f"Attempted OTP request for non-existent email: {email}")
        return False
    
    try:
        last_otp_time = auth_controller_instance.get_last_otp_time(user.userid) if hasattr(auth_controller_instance, 'get_last_otp_time') else None
        
        if last_otp_time and (datetime.datetime.now() - last_otp_time).total_seconds() < 60:
            current_app.logger.warning(f"OTP request too soon for {email}")
            return False

        otp_code = auth_controller_instance.generate_otp(user.userid)
        auth_controller_instance.send_otp_email(email, otp_code)
        current_app.logger.info(f"OTP generated and sent to {email}")
        return True
    
    except Exception as e:
        current_app.logger.error(f"Failed to send OTP to {email}: {e}")
        db.session.rollback()
        return False

def verify_otp_and_login(email, otp_code):
    
    """
    Verifies the OTP and authenticates the user.
    Returns a User object on success, None on failure.
    """
    user = User.query.filter_by(email=email).first()
    
    if not user:
        current_app.logger.warning(f"Login attempt with non-existent email: {email}")
        return None

    if auth_controller_instance.verify_otp(user.userid, otp_code):
        current_app.logger.info(f"User {email} logged in successfully via OTP.")
        return user
    else:
        current_app.logger.warning(f"Invalid OTP attempt for user: {email}")
        return None
