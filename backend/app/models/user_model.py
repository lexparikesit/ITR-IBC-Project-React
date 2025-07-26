from datetime import datetime
from typing import List, TYPE_CHECKING
from app import db
import uuid
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from .user_otp_model import UserOtp


class User(db.Model):

    __tablename__ = "IBC_Users"

    userid = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(150), unique=True, nullable=False)
    firstName = db.Column(db.String(150), nullable=False)
    lastName = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    otps: Mapped[List["UserOtp"]] = relationship(back_populates="user")

    def __repr__(self):
        return f"<User {self.username}>"

    def to_dict(self):
        # Convert object model to dictionary to return as JSON
        data = {
            "userid": (
                str(self.userid) if isinstance(self.userid, uuid.UUID) else self.userid
            ),
            "username": self.username,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            # Note: password is intentionally excluded for security
        }
        return data
