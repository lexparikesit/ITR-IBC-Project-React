from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalFormModel_MA(db.Model):

    __tablename__ = 'Arrival_Manitou_header'
    
    # Primary Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    hourMeter = db.Column(db.Float, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # remarks and metadata
    remarks = db.Column(db.Text(), nullable=False)
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relational with others Table
    items = db.relationship('ArrivalChecklistItemModel_MA', backref='form', lazy=True)
    
    def __repr__(self):
        return f"<ArrivalFormModel_MA {self.VIN}>"