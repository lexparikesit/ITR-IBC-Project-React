import os
from flask_mail import Message
from app import mail

class EmailService:
    
    def send_email(self, to, subject, body, html_body=None):
        """Send Email to Customer"""
        
        msg = Message(
            subject=subject,
            recipients=[to],
            sender=os.getenv("EMAIL_USER")
        )

        if html_body:
            msg.body = body
            msg.html = html_body
        else:
            msg.body = body
        
        mail.send(msg)
