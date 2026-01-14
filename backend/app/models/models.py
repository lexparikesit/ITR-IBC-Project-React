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

    __tablename__ = 'IBC_Users'
    
    userid = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(150), unique=True, nullable=False)
    firstName = db.Column(db.String(150), nullable=False)
    lastName = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)
    otps: Mapped[List["UserOtp"]] = relationship(back_populates="user")
    reset_tokens: Mapped[List["PasswordResetToken"]] = relationship(back_populates="user")
    user_roles = db.relationship("IBCUserRoles", back_populates="user") 
    
    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

class UserOtp(db.Model):

    __tablename__ = 'IBC_Users_OTP'
    
    otp_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[str] = mapped_column(ForeignKey("IBC_Users.userid"))
    user: Mapped[User] = relationship(back_populates="otps")
    otp_code = db.Column(db.String(6), nullable=False)
    expired_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.now, nullable=False)
    
class PasswordResetToken(db.Model):

    __tablename__ = 'IBC_Password_Reset_Token'

    resetId = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Users.userid'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expired_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    user: Mapped[User] = relationship(back_populates="reset_tokens")

class IBCRoles(db.Model):

    __tablename__ = 'IBC_Roles'

    role_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    role_name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    user_roles = db.relationship("IBCUserRoles", back_populates="role")
    role_permissions = db.relationship("IBCRolesPermission", back_populates="role")

class IBCPermissionRoles(db.Model):

    __tablename__ = 'IBC_Permission_Roles'

    permission_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    permission_name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    role_permissions = db.relationship("IBCRolesPermission", back_populates="permission")
    
class IBCRolesPermission(db.Model):

    __tablename__ = 'IBC_Roles_Permission'

    role_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Roles.role_id'), nullable=False, primary_key=True)
    permission_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Permission_Roles.permission_id'), nullable=False, primary_key=True)
    role = db.relationship("IBCRoles", back_populates="role_permissions")
    permission = db.relationship("IBCPermissionRoles", back_populates="role_permissions")

class IBCUserRoles(db.Model):

    __tablename__ = 'IBC_User_Roles'

    userid = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Users.userid'), nullable=False, primary_key=True)
    role_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Roles.role_id'), nullable=False, primary_key=True)
    user = db.relationship("User", back_populates="user_roles")
    role = db.relationship("IBCRoles", back_populates="user_roles")

class RefreshToken(db.Model):

    __tablename__ = 'IBC_Refresh_Tokens'

    token_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('IBC_Users.userid'), nullable=False)
    token_hash = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    revoked_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)

    user: Mapped[User] = relationship(back_populates="refresh_tokens")
