import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import db, User, UserOtp
from app.service.email_service import EmailService
import random
import string


class AuthController:
    def __init__(self):

        self.email_service = EmailService()

    def verify_credentials(self, username, password):

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            return user
        return None

    def generate_otp(self, user_id, length=6):
    
        user_otp = UserOtp(
            user_id=user_id,
            otp_code="".join(random.choices(string.digits, k=length)),
            expired_at=datetime.datetime.now() + datetime.timedelta(minutes=5),
            created_at=datetime.datetime.now(),
        )

        db.session.add(user_otp)
        db.session.commit()

        return user_otp.otp_code
    
    def verify_otp(self, user_id, otp_code):
        
        user_otp = UserOtp.query.filter_by(user_id=user_id, otp_code=otp_code).first()

        if not user_otp:
            return False

        if user_otp.used_at or user_otp.expired_at < datetime.datetime.now():
            return False

        user_otp.used_at = datetime.datetime.now()
        db.session.commit()

        return True

    def send_otp_email(self, email, otp):

        subject = "Your OTP Code"
        body = f"Your OTP code is: {otp}"
        self.email_service.send_email(email, subject, body)

    def create_user(self, data):

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

    def send_otp(self, email, otp_code):
        body = f"Your OTP code is: {otp_code}"
        self.email_service.send_email(email, body)
