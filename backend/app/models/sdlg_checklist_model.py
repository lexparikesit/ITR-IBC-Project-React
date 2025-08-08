from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class SDLGChecklistModels(db.Model):

    __tablename__ = 'Arrival_SDLG'

    # ArrivalID as Primary Key (unique identifier)
    ArrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    distributionName = db.Column(db.String(100), nullable=False)
    containerNo = db.Column(db.String(100), nullable=False)
    leadSealingNo = db.Column(db.String(100), nullable=False)
    VIN = db.Column(db.String(100), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    inspectorSignature = db.Column(db.String(100), nullable=False)
    unitLanded = db.Column(db.DateTime, nullable=False)
    clearanceCustom = db.Column(db.Boolean, nullable=False)
    unitStripping = db.Column(db.DateTime, nullable=False)

    # checklist Itemms
    sn1 = db.Column(db.Boolean, nullable=False)
    sn2 = db.Column(db.Boolean, nullable=False)
    sn3 = db.Column(db.Boolean, nullable=False)
    sn4 = db.Column(db.Boolean, nullable=False)
    sn5 = db.Column(db.Boolean, nullable=False)
    sn6 = db.Column(db.Boolean, nullable=False)
    sn7 = db.Column(db.Boolean, nullable=False)
    sn8 = db.Column(db.Boolean, nullable=False)
    sn9 = db.Column(db.Boolean, nullable=False)
    sn10 = db.Column(db.Boolean, nullable=False)
    sn11 = db.Column(db.Boolean, nullable=False)

    remarks = db.Column(db.String(500), nullable=False)

    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):

        return f"<SDLGChecklistModels {self.machineSN}>"