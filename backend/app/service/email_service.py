import os
from flask_mail import Message
from app import mail

class EmailService:
    
    def send_email(self, to, subject, body):
        msg = Message(subject, recipients=[to], body=body, sender=os.getenv("EMAIL_USER"))
        mail.send(msg)
