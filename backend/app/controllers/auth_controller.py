from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import db, User, UserOtp, PasswordResetToken, IBCPermissionRoles, IBCRolesPermission, IBCRoles, IBCUserRoles
from app.service.email_service import EmailService
from datetime import timedelta
from functools import wraps
from flask import request, jsonify, current_app, g
import random
import string
import datetime
import jwt
import os
import uuid
import string

# configure the JWT
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise ValueError("Error: JWT_SECRET_KEY environment Variable not set. "
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
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

def verify_jwt_token(token):
    """Verifies the JWT token and returns its payload if valid. Returns None if invalid or expired."""
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        current_app.logger.warning("JWT Token Has Expired")
        return None
    except jwt.InvalidTokenError:
        current_app.logger.warning("JWT Token is Invalid")
        return None

def get_user_permissions(user_id):
    """Retrieve the list of permissions (list[str]) for a user based on their user ID (UUID string)."""

    permissions = db.session.query(IBCPermissionRoles.permission_name)\
        .join(IBCRolesPermission, IBCPermissionRoles.permission_id == IBCRolesPermission.permission_id)\
        .join(IBCRoles, IBCRolesPermission.role_id == IBCRoles.role_id)\
        .join(IBCUserRoles, IBCRoles.role_id == IBCUserRoles.role_id)\
        .filter(IBCUserRoles.userid == user_id)\
        .all()
    
    return [perm.permission_name for perm in permissions]

def jwt_required(f):
    """ Decorator to protect the API route, requires a valid JWT token to be present in the HttpOnly 'session_token' cookie.
    Authenticated user information will be stored in `g` (global request context)."""
    
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

def require_permission(permission_name):
    """Decorator to ensure users have certain permissions.Must be used AFTER @jwt_required."""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            
            if not hasattr(g, 'user_id'):
                return jsonify({"message": "Authentication required"}), 401
            
            # get permission user
            user_permissions = get_user_permissions(g.user_id)

            # Check whether the required permissions are available
            if permission_name not in user_permissions:
                return jsonify({"message": "Insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

class AuthController:
    
    def __init__(self):

        self.email_service = EmailService()

    def verify_credentials(self, username, password):
        """Verifies user credentials. Returns the User object if valid, None otherwise."""

        user = User.query.filter_by(username=username).first()
        if user and user.is_active and check_password_hash(user.password, password):
            return user
        return None

    def generate_otp(self, user_id, length=6):
        """Generates a numeric OTP code, saves it to the database, and returns the OTP code."""

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
        """Verifies the OTP code for the given user_id. Returns True if valid, False otherwise."""
        
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
        """Sends a professional OTP code to the user's email address."""

        subject = "Your OTP Code for Indotraktor IBC Portal Login"
        body_text = f"""
            Hello,

            Your One-Time Password (OTP) for logging into the Indotraktor IBC Portal is:

            {otp}

            This OTP is valid for 5 minutes.

            If you did not request this login, please ignore this email or contact your administrator immediately.

            Thank you,
            Indotraktor Command Data Center
        """

        body_html = f"""
        <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>OTP Email</title>
            </head>
            <body style="margin:0; padding:0; background:#f2f4f7;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#f2f4f7;">
                    <tr>
                    <td align="center" style="padding:24px 12px;">
                        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; width:100%; max-width:600px;">
                        <tr>
                            <td style="padding:0;">
                            <!--[if mso]>
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:120px;">
                                <v:fill type="gradient" color="#A91D3A" color2="#EE4266" angle="90" />
                                <v:textbox inset="0,0,0,0">
                            <![endif]-->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:100%;">
                                <tr>
                                <td align="center" style="padding:28px 20px; color:#ffffff; font-family:Arial,sans-serif; text-align:center; background:linear-gradient(90deg,#A91D3A,#EE4266); width:100%; display:block;">
                                    <div style="font-size:22px; font-weight:700; line-height:1.3; margin:0;">Indotraktor IBC Portal</div>
                                    <div style="font-size:14px; line-height:1.4; margin-top:6px; letter-spacing:0.2px;">Secure Login Verification</div>
                                </td>
                                </tr>
                            </table>
                            <!--[if mso]></v:textbox></v:rect><![endif]-->
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:28px 28px 8px; background:#f9f9f9; font-family:Arial,sans-serif; color:#333; line-height:1.6;">
                            <p style="margin:0 0 16px; font-size:16px; mso-line-height-rule:exactly;">Hello,</p>
                            <p style="margin:0 0 18px; font-size:16px; mso-line-height-rule:exactly;">Your One-Time Password (OTP) for logging in is:</p>

                            <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px; border-collapse:collapse;">
                                <tr>
                                <td style="background:#e8f4fd; color:#A91D3A; font-size:28px; font-weight:700; letter-spacing:4px; padding:14px 22px; text-align:center; border-radius:8px; mso-padding-alt:14px 22px;">
                                    {otp}
                                </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 22px; font-size:14px; color:#555; text-align:center; mso-line-height-rule:exactly;">
                                This code is valid for <strong>5 minutes</strong>.
                            </p>

                            <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0 20px;">

                            <p style="margin:0 0 12px; font-size:14px; color:#666; mso-line-height-rule:exactly;">
                                If you did not request this login, please ignore this email or contact your administrator immediately.
                            </p>
                            <p style="margin:0; font-size:14px; color:#444; text-align:center; font-weight:700; mso-line-height-rule:exactly;">
                                Indotraktor Command Data Center
                            </p>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
            </body>
            </html>
        """

        try:
            self.email_service.send_email(
                to=email,
                subject=subject,
                body=body_text,
                html_body=body_html
            )
            current_app.logger.info(f"OTP email sent to {email}")
        
        except Exception as e:
            current_app.logger.error(f"Failed to send OTP email to {email}: {str(e)}")

    def create_user(self, data):
        """Creates a new user. Returns the User object on success, None if email or username already exists."""

        existing_user = User.query.filter_by(email=data["email"]).first()
        existing_user_by_username = User.query.filter_by(username=data["username"]).first()
        
        if existing_user or existing_user_by_username:
            return None
        
        role_name = data.get("role")
        
        if not role_name:
            current_app.logger.warning("Registration attempt without role")
            return None
        
        role = IBCRoles.query.filter_by(role_name=role_name).first()
        
        if not role:
            current_app.logger.warning(f"Registration attempt with invalid role: {role_name}")
            return None
        
        def generate_secure_password(length=12):
            """function to create random password"""
            
            characters = string.ascii_letters + string.digits + "!@#$%^&*"
            return ''.join(random.choice(characters) for i in range(length))

        generated_password = generate_secure_password()
        hashed_password = generate_password_hash(generated_password)

        user = User(
            username=data["username"],
            firstName=data["firstName"],
            lastName=data["lastName"],
            email=data["email"],
            password=hashed_password,
            is_active=True,
        )

        db.session.add(user)
        db.session.commit()

        user_role = IBCUserRoles(userid=user.userid, role_id=role.role_id)
        db.session.add(user_role)

        try:
            db.session.commit()
            current_app.logger.info(f"User {user.username} registered successfully with role {role_name}")
            return user
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to register user: {e}")
            return None
        
    def send_registration_email(self, user):
        """Send professional registration email without password."""
        
        subject = "Welcome to Indotraktor IBC Portal - Account Created"
        body_text = f"""
            Hello {user.firstName} {user.lastName},

            Your account has been successfully created by the Super Admin.

            Account Details:
            Username: {user.username}
            Email: {user.email}

            To set your password, please visit:
            https://ibc.itr-compass.co.id/forgot-password

            Note: For security reasons, your initial password is not included in this email. You must set your own password using the link above.

            This message was sent to you by the Super Admin using the ITR IBC Portal.
            If you did not request this account, please contact your administrator immediately.
        """
        
        body_html = f"""
        <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Welcome Email</title>
                </head>
                <body style="margin:0; padding:0; background:#f2f4f7;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#f2f4f7;">
                        <tr>
                        <td align="center" style="padding:24px 12px;">
                            <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden;">
                            <tr>
                                <td style="padding:0; text-align:center;">
                                <!--[if mso]>
                                <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:120px;">
                                    <v:fill type="gradient" color="#A91D3A" color2="#EE4266" angle="90" />
                                    <v:textbox inset="0,0,0,0">
                                <![endif]-->
                                <div style="background:linear-gradient(90deg,#A91D3A,#EE4266); padding:28px 20px; color:#ffffff; font-family:Arial,sans-serif;">
                                    <div style="font-size:22px; font-weight:700; line-height:1.3; margin:0;">Welcome to Indotraktor IBC Portal</div>
                                    <div style="font-size:14px; line-height:1.4; margin-top:6px; letter-spacing:0.2px;">Secure Account Creation</div>
                                </div>
                                <!--[if mso]></v:textbox></v:rect><![endif]-->
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:28px 28px 8px; background:#f9f9f9; font-family:Arial,sans-serif; color:#333; line-height:1.6;">
                                <p style="margin:0 0 16px; font-size:16px; mso-line-height-rule:exactly;">Hello <strong>{user.firstName} {user.lastName}</strong>,</p>
                                <p style="margin:0 0 18px; font-size:16px; mso-line-height-rule:exactly;">Your account has been successfully created by the Super Admin.</p>

                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; background:#e8f4fd; border-radius:6px; margin:20px 0; padding:0;">
                                    <tr>
                                    <td style="padding:15px 18px; font-size:14px; color:#A91D3A; font-weight:700;">Account Details:</td>
                                    </tr>
                                    <tr>
                                    <td style="padding:0 18px 10px; font-size:14px; color:#333; mso-line-height-rule:exactly;"><strong>Username:</strong> {user.username}</td>
                                    </tr>
                                    <tr>
                                    <td style="padding:0 18px 15px; font-size:14px; color:#333; mso-line-height-rule:exactly;"><strong>Email:</strong> {user.email}</td>
                                    </tr>
                                </table>

                                <p style="margin:0 0 14px; font-size:16px; color:#333; mso-line-height-rule:exactly;">To set your password, please click the button below:</p>

                                <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 22px; border-collapse:collapse;">
                                    <tr>
                                    <td align="center" style="background:#A91D3A; color:#ffffff; padding:12px 30px; border-radius:6px; font-weight:700; font-size:14px; font-family:Arial,sans-serif; mso-padding-alt:12px 30px;">
                                        <a href="https://ibc.itr-compass.co.id/forgot-password" style="color:#ffffff; text-decoration:none; display:inline-block;">Set Your Password</a>
                                    </td>
                                    </tr>
                                </table>

                                <p style="margin:0 0 16px; font-size:14px; color:#666; mso-line-height-rule:exactly;">
                                    <strong>Note:</strong> For security reasons, your initial password is not included in this email. You must set your own password using the link above.
                                </p>

                                <hr style="border:none; border-top:1px solid #e5e7eb; margin:18px 0 20px;">

                                <p style="margin:0 0 10px; font-size:14px; color:#888; mso-line-height-rule:exactly;">
                                    This message was sent to you by the Super Admin using the ITR IBC Portal.<br>
                                    If you did not request this account, please contact your administrator immediately.
                                </p>
                                </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>
                </body>
            </html>
        """        
        try:
            self.email_service.send_email(
                to=user.email,
                subject=subject,
                body=body_text,
                html_body=body_html
            )
            current_app.logger.info(f"✅ Registration email sent to {user.email}")
        
        except Exception as e:
            current_app.logger.error(f"❌ Failed to send registration email to {user.email}: {str(e)}")

    def forgot_password_request_otp(self, email):
        """Handles OTP requests for password reset. Searches for users, generates OTP, and sends it via email."""

        user = User.query.filter_by(email=email).first()

        if not user:
            current_app.logger.warning(f"Forgot password attempt for non-existent email: {email}")
            return {"message": "If this email is registered, you will receive an OTP code."}, 200
        
        try:
            otp_code = self.generate_otp(user.userid)

            self.send_otp_email(user.email, otp_code)
            current_app.logger.info(f"OTP for password reset sent to {email}")
            return {"message": "OTP has been sent to your email."}, 200
        
        except Exception as e:
            current_app.logger.error(f"Failed to send OTP to {email} for password reset: {e}")
            db.session.rollback()
            return {"message": "Failed to send OTP. Please try again later."}, 500

    def forgot_password_verify_otp(self, email, otp_code):
        """ Verifies the OTP for password reset. Returns the User object on success, None on failure."""
        
        user = User.query.filter_by(email=email).first()

        if not user or not self.verify_otp(user.userid, otp_code):
            return {"message": "Invalid or expired OTP code."}, 400
        
        try:
            PasswordResetToken.query.filter_by(user_id=user.userid).delete()
            db.session.commit()

            reset_token = str(uuid.uuid4())
            new_token = PasswordResetToken(
                user_id=user.userid,
                token=reset_token,
                expired_at=datetime.datetime.now() + datetime.timedelta(minutes=60),
                created_at=datetime.datetime.now(),
            )
            db.session.add(new_token)
            db.session.commit()

            return {"message": "OTP verified successfully.", "token": reset_token}, 200
        
        except Exception as e:
            current_app.logger.error(f"Failed to generate reset token for user {email}: {e}")
            db.session.rollback()
            return {"message": "Failed to generate password reset token. Please try again."}, 500

    def reset_password(self, token, new_password):
        """Resets the user's password using a valid reset token."""
        
        reset_token_entry = PasswordResetToken.query.filter_by(
            token=token,
            used_at=None
        ).filter(
            PasswordResetToken.expired_at > datetime.datetime.now()
        ).first()

        if not reset_token_entry:
            return {"message": "Invalid or expired token."}, 400

        user = User.query.get(reset_token_entry.user_id)
        if not user:
            return {"message": "User not found."}, 404

        try:
            user.password = generate_password_hash(new_password)
            reset_token_entry.used_at = datetime.datetime.now()
            db.session.commit()
            return {"message": "Password has been reset successfully."}, 200
        
        except Exception as e:
            current_app.logger.error(f"Failed to reset password for user {user.email}: {e}")
            db.session.rollback()
            return {"message": "Failed to reset password. Please try again."}, 500

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
    """Verifies the OTP and authenticates the user. Returns a User object on success, None on failure."""
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        current_app.logger.warning(f"Login attempt with non-existent email: {email}")
        return None

    if not user.is_active:
        current_app.logger.warning(f"Login attempt with deactivated account: {email}")
        return None

    if auth_controller_instance.verify_otp(user.userid, otp_code):
        current_app.logger.info(f"User {email} logged in successfully via OTP.")
        return user
    else:
        current_app.logger.warning(f"Invalid OTP attempt for user: {email}")
        return None

def forgot_password_request_otp(email):
    """Wrapper for AuthController.forgot_password_request_otp."""
    
    return auth_controller_instance.forgot_password_request_otp(email)

def forgot_password_verify_otp(email, otp_code):
    """Wrapper for AuthController.forgot_password_verify_otp."""
    
    return auth_controller_instance.forgot_password_verify_otp(email, otp_code)

def forgot_password_reset(token, new_password):
    """Wrapper for AuthController.reset_password."""
    
    return auth_controller_instance.reset_password(token, new_password)
