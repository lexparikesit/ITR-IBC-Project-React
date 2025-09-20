from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class StorageMaintenanceFormModel_MA(db.Model):

    __tablename__ = 'Maintenance_Manitou_header'
    
    # Primary Key
    smID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    hourMeter = db.Column(db.Float, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # remarks and metadata
    remarks = db.Column(db.Text(), nullable=True)
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    # relational with others Table
    items = db.relationship('StorageMaintenanceChecklistItemModel_MA', backref='form', lazy=True)

    def __repr__(self):
        return f"<StorageMaintenanceFormModel_MA {self.VIN}>"