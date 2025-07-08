from datetime import datetime
from typing import List
from app import db
import uuid
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import relationship

class User(db.Model):

    __tablename__ = 'users'
    
    userid = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(150), unique=True, nullable=False)
    firstName = db.Column(db.String(150), nullable=False)
    lastName = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    otps: Mapped[List["UserOtp"]] = relationship(back_populates="user")

class UserOtp(db.Model):

    __tablename__ = 'user_otp'
    
    otp_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.userid"))
    user: Mapped[User] = relationship(back_populates="otps")
    otp_code = db.Column(db.String(6), nullable=False)
    expired_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    created_at: Mapped[datetime] = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', backref=db.backref('otp_codes', lazy=True))