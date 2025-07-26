from datetime import datetime
from typing import TYPE_CHECKING
from app import db
import uuid
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from .user_model import User

class UserOtp(db.Model):

    __tablename__ = 'IBC_Users_OTP'
    
    otp_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(ForeignKey("IBC_Users.userid"))
    user: Mapped["User"] = relationship(back_populates="otps")
    otp_code = db.Column(db.String(6), nullable=False)
    expired_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.now, nullable=False)

    def __repr__(self):
        return f"<UserOtp {self.otp_code}>"
    
    def to_dict(self):
        # Convert object model to dictionary to return as JSON
        data = {
            'otp_id': str(self.otp_id) if isinstance(self.otp_id, uuid.UUID) else self.otp_id,
            'user_id': str(self.user_id) if isinstance(self.user_id, uuid.UUID) else self.user_id,
            'otp_code': self.otp_code,
            'expired_at': self.expired_at.isoformat() if self.expired_at else None,
            'used_at': self.used_at.isoformat() if self.used_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        return data

    @property
    def is_expired(self):
        """Check if OTP is expired"""
        return datetime.now() > self.expired_at if self.expired_at else True
    
    @property
    def is_used(self):
        """Check if OTP has been used"""
        return self.used_at is not None
