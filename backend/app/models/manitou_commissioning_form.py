from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class CommissioningFormModel_MA(db.Model):
    
    __tablename__ = 'Comm_Manitou_header'
    
    # Primary Key 
    commID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    UnitType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    hourMeter = db.Column(db.Float, nullable=False)
    deliveryDate = db.Column(db.DateTime, nullable=False)
    commissioningDate = db.Column(db.DateTime, nullable=False)
    inspectorSignature = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False) 
    
    # remarks and metadata
    remarks = db.Column(db.Text(), nullable=True)
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relational with others Table
    items = db.relationship('CommissioningChecklistItemModel_MA', backref='form', lazy=True)
    
    def __repr__(self):
        return f"<CommissioningFormModel_MA {self.VIN}>"