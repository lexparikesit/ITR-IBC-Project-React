from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

# main table
class StorageMaintenanceFormModel_SDLG(db.Model):
    
    __tablename__ = "Maintenance_Sdlg_header"

    # Primary Key
    smID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    
    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    hourMeter = db.Column(db.Float, nullable=False)
    vehicleArrivalDate = db.Column(db.DateTime, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # approval
    signatureTechnician = db.Column(db.String(200), nullable=False)
    signatureTechnicianDate = db.Column(db.DateTime, nullable=False)
    signatureApprover = db.Column(db.String(200), nullable=False)
    signatureApproverDate = db.Column(db.DateTime, nullable=False)
    
    # metadata
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    # relation to support table
    defect = db.relationship('Maintenance_sdlg_defect_remarks', backref='sdlg_report', lazy=True, cascade="all, delete-orphan")
    items = db.relationship('StorageMaintenanceChecklistItemModel_SDLG', backref='sdlg_report', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<StorageMaintenanceFormModel_SDLG{self.smID}', WO='{self.woNumber}')>"

# support table
class Maintenance_sdlg_defect_remarks(db.Model):

    __tablename__ = 'Maintenance_Sdlg_remarks'

    # primary key
    defectID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # foreign key
    smID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Maintenance_Sdlg_header.smID', ondelete='CASCADE'), nullable=False)
    
    # description and remarks
    description = db.Column(db.Text(), nullable=False)
    remarks = db.Column(db.Text(), nullable=True)    

    def __repr__(self):
        return f"<Maintenance_sdlg_defect_remarks {self.smID}>"