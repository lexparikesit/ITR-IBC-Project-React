from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class RenaultMaintenanceModel(db.Model):

    __tablename__ = 'Storage_Renault'
    
    # AC_ID as Primary Key (unique identifier)
    storageID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    VIN = db.Column(db.String(50), nullable=False)
    engineType = db.Column(db.String(50), nullable=False)
    transmissionType = db.Column(db.String(50), nullable=False)
    hourMeter = db.Column(db.Integer, nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # column ops
    ops1 = db.Column(db.SmallInteger, nullable=False)
    ops2 = db.Column(db.SmallInteger, nullable=False)
    ops3 = db.Column(db.SmallInteger, nullable=False)
    ops4 = db.Column(db.SmallInteger, nullable=False)
    ops5 = db.Column(db.SmallInteger, nullable=False)
    ops6 = db.Column(db.SmallInteger, nullable=False)
    ops7 = db.Column(db.SmallInteger, nullable=False)
    ops8 = db.Column(db.SmallInteger, nullable=False)
    ops9 = db.Column(db.SmallInteger, nullable=False)
    ops10 = db.Column(db.SmallInteger, nullable=False)

    ops11 = db.Column(db.SmallInteger, nullable=False)
    ops12 = db.Column(db.SmallInteger, nullable=False)
    ops13 = db.Column(db.SmallInteger, nullable=False)
    ops14 = db.Column(db.SmallInteger, nullable=False)
    ops15 = db.Column(db.SmallInteger, nullable=False)
    ops16 = db.Column(db.SmallInteger, nullable=False)
    ops17 = db.Column(db.SmallInteger, nullable=False)
    ops18 = db.Column(db.SmallInteger, nullable=False)
    ops19 = db.Column(db.SmallInteger, nullable=False)
    ops20 = db.Column(db.SmallInteger, nullable=False)

    ops21 = db.Column(db.SmallInteger, nullable=False)
    ops22 = db.Column(db.SmallInteger, nullable=False)
    ops23 = db.Column(db.SmallInteger, nullable=False)
    ops24 = db.Column(db.SmallInteger, nullable=False)
    ops25 = db.Column(db.SmallInteger, nullable=False)
    ops26 = db.Column(db.SmallInteger, nullable=False)
    ops27 = db.Column(db.SmallInteger, nullable=False)
    ops28 = db.Column(db.SmallInteger, nullable=False)
    ops29 = db.Column(db.SmallInteger, nullable=False)
    ops30 = db.Column(db.SmallInteger, nullable=False)

    ops31 = db.Column(db.SmallInteger, nullable=False)
    ops32 = db.Column(db.SmallInteger, nullable=False)
    ops33 = db.Column(db.SmallInteger, nullable=False)
    ops34 = db.Column(db.SmallInteger, nullable=False)
    ops35 = db.Column(db.SmallInteger, nullable=False)
    ops36 = db.Column(db.SmallInteger, nullable=False)
    ops37 = db.Column(db.SmallInteger, nullable=False)
    ops38 = db.Column(db.SmallInteger, nullable=False)
    ops39 = db.Column(db.SmallInteger, nullable=False)
    ops40 = db.Column(db.SmallInteger, nullable=False)

    ops41 = db.Column(db.SmallInteger, nullable=False)
    ops42 = db.Column(db.SmallInteger, nullable=False)
    ops43 = db.Column(db.SmallInteger, nullable=False)
    ops44 = db.Column(db.SmallInteger, nullable=False)
    ops45 = db.Column(db.SmallInteger, nullable=False)
    ops46 = db.Column(db.SmallInteger, nullable=False)
    ops47 = db.Column(db.SmallInteger, nullable=False)
    ops48 = db.Column(db.SmallInteger, nullable=False)
    ops49 = db.Column(db.SmallInteger, nullable=False)
    ops50 = db.Column(db.SmallInteger, nullable=False)
    ops51 = db.Column(db.SmallInteger, nullable=False)
    ops52 = db.Column(db.SmallInteger, nullable=False)

    # Battery electrolyte level
    FRBattery_electrolyte_level = db.Column(db.Integer, nullable=False)
    RRBattery_electrolyte_level = db.Column(db.Integer, nullable=False)
    FRBattery_statusOn = db.Column(db.String(50), nullable=False)
    RRBattery_statusOn = db.Column(db.String(50), nullable=False)
    FRBattery_voltage = db.Column(db.Integer, nullable=False)
    RRBattery_voltage = db.Column(db.Integer, nullable=False)

    # Fault codes
    FaultCode1 = db.Column(db.String(50), nullable=True)
    FaultCode2 = db.Column(db.String(50), nullable=True)
    FaultCode3 = db.Column(db.String(50), nullable=True)
    FaultCode4 = db.Column(db.String(50), nullable=True)
    FaultCode5 = db.Column(db.String(50), nullable=True)

    # Fault codes Status
    status1 = db.Column(db.String(300), nullable=True)
    status2 = db.Column(db.String(300), nullable=True)
    status3 = db.Column(db.String(300), nullable=True)
    status4 = db.Column(db.String(300), nullable=True)
    status5 = db.Column(db.String(300), nullable=True)

    # general remarks
    generalRemarks = db.Column(db.String(500), nullable=True)

    # created by and on
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False)