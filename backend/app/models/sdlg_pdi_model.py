from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class SdlgPDIModel(db.Model):

    __tablename__ = 'PDI_SDLG'

    # pdi ID
    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # information unit
    woNumber = db.Column(db.String(50), nullable=False)
    machineModel = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    pdiInspector = db.Column(db.String(200), nullable=False)

    # column
    sn1 = db.Column(db.Boolean(), nullable=False)
    sn2 = db.Column(db.Boolean(), nullable=False)
    sn3 = db.Column(db.Boolean(), nullable=False)
    sn4 = db.Column(db.Boolean(), nullable=False)
    sn5 = db.Column(db.Boolean(), nullable=False)
    sn6 = db.Column(db.Boolean(), nullable=False)
    sn7 = db.Column(db.Boolean(), nullable=False)
    
    inspectorSignature = db.Column(db.String(200), nullable=False)
    inspectorSignatureDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    supervisorSignature = db.Column(db.String(200), nullable=False)
    supervisorSignatureDate = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relation to support table
    defect = db.relationship(
        'SDLGDefectsAndRemarksPDI',
        backref='sdlg_pdi_report', 
        lazy=True, 
        cascade="all, delete-orphan"
    )

# support table
class SDLGDefectsAndRemarksPDI(db.Model):

    __tablename__ = 'SDLGDefectsAndRemarksPDI'

    defectID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pdiID = db.Column(
        UNIQUEIDENTIFIER, 
        db.ForeignKey('PDI_SDLG.pdiID', ondelete='CASCADE'), 
        nullable=False
    )
    description = db.Column(db.Text(), nullable=False)
    remarks = db.Column(db.Text(), nullable=False)