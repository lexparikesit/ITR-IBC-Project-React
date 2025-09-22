from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalFormModel_SDLG(db.Model):

    __tablename__ = 'Arrival_Sdlg_header'

    # Primary Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit Information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    distributionName = db.Column(db.String(255), nullable=False)
    containerNo = db.Column(db.String(255), nullable=False)
    leadSealingNo = db.Column(db.String(255), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    unitLanded = db.Column(db.DateTime, nullable=False)
    clearanceCustom = db.Column(db.Boolean, nullable=False)
    unitStripping = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # remarks and metadata
    remarks = db.Column(db.Text(), nullable=False)
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relational with others Table
    items = db.relationship('ArrivalChecklistItemModel_SDLG', backref='arrival_form', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<ArrivalFormModel_SDLG {self.VIN}>"