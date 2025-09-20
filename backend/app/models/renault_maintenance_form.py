from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class StorageMaintenanceFormModel_RT(db.Model):

    __tablename__ = 'Maintenance_Renault_header'
    
    # Primary Key
    smID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    engineType = db.Column(db.String(50), nullable=False)
    transmissionType = db.Column(db.String(50), nullable=False)
    hourMeter = db.Column(db.Float, nullable=False)
    mileage = db.Column(db.Float, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # remarks and metadata
    generalRemarks = db.Column(db.Text(), nullable=True)
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False)

    # relational with others Table
    items = db.relationship('StorageMaintenanceChecklistItemModel_RT', backref='form', lazy=True)

    def __repr__(self):
        return f"<StorageMaintenanceFormModel_RT {self.VIN}>"