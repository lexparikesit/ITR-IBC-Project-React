from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class PDIFormModel_RT(db.Model):

    __tablename__ = 'PDI_Renault_header'

    # Primary Key
    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False) 
    woNumber = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    Date = db.Column(db.DateTime, nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    mileage = db.Column(db.Float, nullable=False)
    chassisID = db.Column(db.String(50), nullable=False)
    registrationNo = db.Column(db.String(50), nullable=False)
    province = db.Column(db.String(255), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    engine = db.Column(db.String(50), nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)
    
    # remarks and metadata
    vehicle_inspection = db.Column(db.Text(), nullable=False)
    createdBy = db.Column(db.String(100), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # relational with others Table
    items = db.relationship('PDIChecklistItemModel_RT', backref='form', lazy=True)

    def __repr__(self):
        return f"<PDIFormModel_RT{self.pdiID}', WO='{self.woNumber}')>"