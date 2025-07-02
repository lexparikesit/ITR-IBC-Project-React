from werkzeug.security import generate_password_hash, check_password_hash
from app.models.models import db, User
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

    def generate_otp(self, length=6):
        
        return ''.join(random.choices(string.digits, k=length))

    def send_otp_email(self, email, otp):
        
        subject = "Your OTP Code"
        body = f"Your OTP code is: {otp}"
        self.email_service.send_email(email, subject, body)

    def create_user(self, data):
        
        hashed_password = generate_password_hash(data['password'])
        
        user = User(
            username=data['username'],
            firstName=data['firstName'],
            lastName=data['lastName'],
            email=data['email'],
            password=hashed_password
        )

        db.session.add(user)
        db.session.commit()

        return user
        
    def send_otp(self, email, otp_code):
        body = f"Your OTP code is: {otp_code}"
        self.email_service.send_email(email, body)