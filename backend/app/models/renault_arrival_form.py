from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalFormModel_RT(db.Model):

    __tablename__ = 'Arrival_Renault_header'
    
    # Primary Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    noEngine = db.Column(db.String(50), nullable=False)
    noChassis = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    dateOfCheck = db.Column(db.Date, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # remarks and metadata
    remarks = db.Column(db.Text(), nullable=False)
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # relational with others Table
    items = db.relationship('ArrivalChecklistItemModel_RT', backref='form', lazy=True)
    
    def __repr__(self):
        return f"<ArrivalFormModel_RT {self.VIN}>"
