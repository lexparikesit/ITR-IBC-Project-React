from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class CommissioningFormModel_SDLG(db.Model):

    __tablename__ = 'Comm_Sdlg_header'

    # Primary Key
    commID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Unit Information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    typeModel = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # metadata
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    # relational with others Table
    items = db.relationship('CommissioningChecklistItemModel_SDLG', backref='form', lazy=True)

    def __repr__(self):
        return f"<CommissioningFormModel_SDLG {self.VIN}>"