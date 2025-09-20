from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class PDIFormModel_MA(db.Model):
    
    __tablename__ = 'PDI_Manitou_header'

    # Primary Key
    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    dealerCode = db.Column(db.String(10), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    machineType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    deliveryDate = db.Column(db.DateTime, nullable=False)
    checkingDate = db.Column(db.DateTime, nullable=False)
    HourMeter = db.Column(db.Float, nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    approver = db.Column(db.String(200), nullable=False)
    inspectorSignature = db.Column(db.String(200), nullable=False)

    # remarks and metadata
    remarksTransport = db.Column(db.Text(), nullable=True)
    generalRemarks = db.Column(db.Text(), nullable=True)
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relational with others Table
    items = db.relationship('PDIChecklistItemModel_MA', backref='form', lazy=True)

    def __repr__(self):
        return f"<PDIFormModel_MA {self.VIN}>"
