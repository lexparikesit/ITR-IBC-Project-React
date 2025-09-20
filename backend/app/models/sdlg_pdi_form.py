from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class PDIFormModel_Sdlg(db.Model):

    __tablename__ = 'PDI_Sdlg_header'

    # Primary Key
    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit information
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    machineModel = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)
    technicianSignature = db.Column(db.String(200), nullable=False)
    technicianSignatureDate = db.Column(db.DateTime, nullable=False)
    approverSignature = db.Column(db.String(200), nullable=False)
    approverSignatureDate = db.Column(db.DateTime, nullable=False)
    
    # meta data
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relation to support table
    defect_and_remarks = db.relationship('PDI_sdlg_defect_remarks', backref='sdlg_pdi_report', lazy=True, cascade="all, delete-orphan")
    items = db.relationship('PDIChecklistItemModel_SDLG', backref='form', lazy=True, cascade="all, delete-orphan") 
    
    def __repr__(self):
        return f"<PDIFormModel_Sdlg{self.pdiID}', WO='{self.woNumber}')>"

# support table
class PDI_sdlg_defect_remarks(db.Model):

    __tablename__ = 'PDI_Sdlg_remarks'

    # primary key
    defectID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # foreign key
    pdiID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('PDI_Sdlg_header.pdiID', ondelete='CASCADE'), nullable=False)
    
    # description and remarks
    description = db.Column(db.Text(), nullable=True)
    remarks = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<PDI_sdlg_defect_remarks'{self.defectID}', pdiID='{self.pdiID}')>"