from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class User(db.Model):

    __tablename__ = 'IBC_User'
    
    userid = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(150), unique=True, nullable=False)
    firstName = db.Column(db.String(150), nullable=False)
    lastName = db.Column(db.String(150))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)