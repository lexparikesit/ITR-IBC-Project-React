from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

# main table
class SDLGMaintenanceModel(db.Model):
    
    __tablename__ = "Storage_SDLG"

    # main column
    storageID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    model = db.Column(db.String(50), nullable=False)
    vehicleNumber = db.Column(db.String(50), nullable=False)
    workingHour = db.Column(db.Float, nullable=False)
    vehicleArrival = db.Column(db.DateTime, nullable=False)
    inspectionDate = db.Column(db.DateTime, nullable=False)
    inspector = db.Column(db.String(100), nullable=False)

    # inspection
    inspection1 = db.Column(db.Boolean, nullable=False)
    inspection2 = db.Column(db.Boolean, nullable=False)
    inspection3 = db.Column(db.Boolean, nullable=False)
    inspection4 = db.Column(db.Boolean, nullable=False)
    inspection5 = db.Column(db.Boolean, nullable=False)
    inspection6 = db.Column(db.Boolean, nullable=False)
    inspection7 = db.Column(db.Boolean, nullable=False)
    inspection8 = db.Column(db.Boolean, nullable=False)
    inspection9 = db.Column(db.Boolean, nullable=False) 

    # testing
    testing10 = db.Column(db.Boolean, nullable=False)
    testing11 = db.Column(db.Boolean, nullable=False)
    testing12 = db.Column(db.Boolean, nullable=False)
    testing13 = db.Column(db.Boolean, nullable=False)
    testing14 = db.Column(db.Boolean, nullable=False)
    testing15 = db.Column(db.Boolean, nullable=False)
    testing16 = db.Column(db.Boolean, nullable=False)
    testing17 = db.Column(db.Boolean, nullable=False)
    testing18 = db.Column(db.Boolean, nullable=False)
    testing19 = db.Column(db.Boolean, nullable=False)
    testing20 = db.Column(db.Boolean, nullable=False)
    testing21 = db.Column(db.Boolean, nullable=False)
    testing22 = db.Column(db.Boolean, nullable=False)
    testing23 = db.Column(db.Boolean, nullable=False)

    # signature
    signatureInspector = db.Column(db.String(100), nullable=False)
    signatureSupervisor = db.Column(db.String(100), nullable=False)
    signatureInspectorDate = db.Column(db.DateTime, nullable=False)
    signatureSupervisorDate = db.Column(db.DateTime, nullable=False)
    

    # relation to support table
    defect = db.relationship(
        'SDLGDefectsAndRemarksModel',
        backref='sdlg_report', 
        lazy=True, 
        cascade="all, delete-orphan"
    )

# support table
class SDLGDefectsAndRemarksModel(db.Model):

    __tablename__ = 'SDLGDefectsAndRemarks'

    defectID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    storageID = db.Column(
        UNIQUEIDENTIFIER, 
        db.ForeignKey('Storage_SDLG.storageID', ondelete='CASCADE'), 
        nullable=False
    )
    description = db.Column(db.String(500), nullable=False)
    remarks = db.Column(db.String(500), nullable=True)    