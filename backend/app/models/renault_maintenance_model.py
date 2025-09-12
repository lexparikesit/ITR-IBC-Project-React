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
    hourMeter = db.Column(db.Float, nullable=False)
    mileage = db.Column(db.Float, nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # column ops
    ops1 = db.Column(db.SmallInteger, nullable=False)
    img_ops1 = db.Column(db.String(255), nullable=False)
    caption_ops1 = db.Column(db.Text(), nullable=False)

    ops2 = db.Column(db.SmallInteger, nullable=False)
    img_ops2 = db.Column(db.String(255), nullable=False)
    caption_ops2 = db.Column(db.Text(), nullable=False)

    ops3 = db.Column(db.SmallInteger, nullable=False)
    img_ops3 = db.Column(db.String(255), nullable=False)
    caption_ops3 = db.Column(db.Text(), nullable=False)

    ops4 = db.Column(db.SmallInteger, nullable=False)
    img_ops4 = db.Column(db.String(255), nullable=False)
    caption_ops4 = db.Column(db.Text(), nullable=False)

    ops5 = db.Column(db.SmallInteger, nullable=False)
    img_ops5 = db.Column(db.String(255), nullable=False)
    caption_ops5 = db.Column(db.Text(), nullable=False)

    ops6 = db.Column(db.SmallInteger, nullable=False)
    img_ops6 = db.Column(db.String(255), nullable=False)
    caption_ops6 = db.Column(db.Text(), nullable=False)

    ops7 = db.Column(db.SmallInteger, nullable=False)
    img_ops7 = db.Column(db.String(255), nullable=False)
    caption_ops7 = db.Column(db.Text(), nullable=False)

    ops8 = db.Column(db.SmallInteger, nullable=False)
    img_ops8 = db.Column(db.String(255), nullable=False)
    caption_ops8 = db.Column(db.Text(), nullable=False)

    ops9 = db.Column(db.SmallInteger, nullable=False)
    img_ops9 = db.Column(db.String(255), nullable=False)
    caption_ops9 = db.Column(db.Text(), nullable=False)

    ops10 = db.Column(db.SmallInteger, nullable=False)
    img_ops10 = db.Column(db.String(255), nullable=False)
    caption_ops10 = db.Column(db.Text(), nullable=False)

    ops11 = db.Column(db.SmallInteger, nullable=False)
    img_ops11 = db.Column(db.String(255), nullable=False)
    caption_ops11 = db.Column(db.Text(), nullable=False)

    ops12 = db.Column(db.SmallInteger, nullable=False)
    img_ops12 = db.Column(db.String(255), nullable=False)
    caption_ops12 = db.Column(db.Text(), nullable=False)

    ops13 = db.Column(db.SmallInteger, nullable=False)
    img_ops13 = db.Column(db.String(255), nullable=False)
    caption_ops13 = db.Column(db.Text(), nullable=False)

    ops14 = db.Column(db.SmallInteger, nullable=False)
    img_ops14 = db.Column(db.String(255), nullable=False)
    caption_ops14 = db.Column(db.Text(), nullable=False)

    ops15 = db.Column(db.SmallInteger, nullable=False)
    img_ops15 = db.Column(db.String(255), nullable=False)
    caption_ops15 = db.Column(db.Text(), nullable=False)

    ops16 = db.Column(db.SmallInteger, nullable=False)
    img_ops16 = db.Column(db.String(255), nullable=False)
    caption_ops16 = db.Column(db.Text(), nullable=False)
    
    ops17 = db.Column(db.SmallInteger, nullable=False)
    img_ops17 = db.Column(db.String(255), nullable=False)
    caption_ops17 = db.Column(db.Text(), nullable=False)

    ops18 = db.Column(db.SmallInteger, nullable=False)
    img_ops18 = db.Column(db.String(255), nullable=False)
    caption_ops18 = db.Column(db.Text(), nullable=False)

    ops19 = db.Column(db.SmallInteger, nullable=False)
    img_ops19 = db.Column(db.String(255), nullable=False)
    caption_ops19 = db.Column(db.Text(), nullable=False)

    ops20 = db.Column(db.SmallInteger, nullable=False)
    img_ops20 = db.Column(db.String(255), nullable=False)
    caption_ops20 = db.Column(db.Text(), nullable=False)

    ops21 = db.Column(db.SmallInteger, nullable=False)
    img_ops21 = db.Column(db.String(255), nullable=False)
    caption_ops21 = db.Column(db.Text(), nullable=False)

    ops22 = db.Column(db.SmallInteger, nullable=False)
    img_ops22 = db.Column(db.String(255), nullable=False)
    caption_ops22 = db.Column(db.Text(), nullable=False)

    ops23 = db.Column(db.SmallInteger, nullable=False)
    img_ops23 = db.Column(db.String(255), nullable=False)
    caption_ops23 = db.Column(db.Text(), nullable=False)

    ops24 = db.Column(db.SmallInteger, nullable=False)
    img_ops24 = db.Column(db.String(255), nullable=False)
    caption_ops24 = db.Column(db.Text(), nullable=False)

    ops25 = db.Column(db.SmallInteger, nullable=False)
    img_ops25 = db.Column(db.String(255), nullable=False)
    caption_ops25 = db.Column(db.Text(), nullable=False)

    ops26 = db.Column(db.SmallInteger, nullable=False)
    img_ops26 = db.Column(db.String(255), nullable=False)
    caption_ops26 = db.Column(db.Text(), nullable=False)

    ops27 = db.Column(db.SmallInteger, nullable=False)
    img_ops27 = db.Column(db.String(255), nullable=False)
    caption_ops27 = db.Column(db.Text(), nullable=False)

    ops28 = db.Column(db.SmallInteger, nullable=False)
    img_ops28 = db.Column(db.String(255), nullable=False)
    caption_ops28 = db.Column(db.Text(), nullable=False)

    ops29 = db.Column(db.SmallInteger, nullable=False)
    img_ops29 = db.Column(db.String(255), nullable=False)
    caption_ops29 = db.Column(db.Text(), nullable=False)

    ops30 = db.Column(db.SmallInteger, nullable=False)
    img_ops30 = db.Column(db.String(255), nullable=False)
    caption_ops30 = db.Column(db.Text(), nullable=False)

    ops31 = db.Column(db.SmallInteger, nullable=False)
    img_ops31 = db.Column(db.String(255), nullable=False)
    caption_ops31 = db.Column(db.Text(), nullable=False)

    ops32 = db.Column(db.SmallInteger, nullable=False)
    img_ops32 = db.Column(db.String(255), nullable=False)
    caption_ops32 = db.Column(db.Text(), nullable=False)

    ops33 = db.Column(db.SmallInteger, nullable=False)
    img_ops33 = db.Column(db.String(255), nullable=False)
    caption_ops33 = db.Column(db.Text(), nullable=False)

    ops34 = db.Column(db.SmallInteger, nullable=False)
    img_ops34 = db.Column(db.String(255), nullable=False)
    caption_ops34 = db.Column(db.Text(), nullable=False)

    ops35 = db.Column(db.SmallInteger, nullable=False)
    img_ops35 = db.Column(db.String(255), nullable=False)
    caption_ops35 = db.Column(db.Text(), nullable=False)

    ops36 = db.Column(db.SmallInteger, nullable=False)
    img_ops36 = db.Column(db.String(255), nullable=False)
    caption_ops36 = db.Column(db.Text(), nullable=False)

    ops37 = db.Column(db.SmallInteger, nullable=False)
    img_ops37 = db.Column(db.String(255), nullable=False)
    caption_ops37 = db.Column(db.Text(), nullable=False)

    ops38 = db.Column(db.SmallInteger, nullable=False)
    img_ops38 = db.Column(db.String(255), nullable=False)
    caption_ops38 = db.Column(db.Text(), nullable=False)

    ops39 = db.Column(db.SmallInteger, nullable=False)
    img_ops39 = db.Column(db.String(255), nullable=False)
    caption_ops39 = db.Column(db.Text(), nullable=False)

    ops40 = db.Column(db.SmallInteger, nullable=False)
    img_ops40 = db.Column(db.String(255), nullable=False)
    caption_ops40 = db.Column(db.Text(), nullable=False)

    ops41 = db.Column(db.SmallInteger, nullable=False)
    img_ops41 = db.Column(db.String(255), nullable=False)
    caption_ops41 = db.Column(db.Text(), nullable=False)

    ops42 = db.Column(db.SmallInteger, nullable=False)
    img_ops42 = db.Column(db.String(255), nullable=False)
    caption_ops42 = db.Column(db.Text(), nullable=False)

    ops43 = db.Column(db.SmallInteger, nullable=False)
    img_ops43 = db.Column(db.String(255), nullable=False)
    caption_ops43 = db.Column(db.Text(), nullable=False)

    ops44 = db.Column(db.SmallInteger, nullable=False)
    img_ops44 = db.Column(db.String(255), nullable=False)
    caption_ops44 = db.Column(db.Text(), nullable=False)

    ops45 = db.Column(db.SmallInteger, nullable=False)
    img_ops45 = db.Column(db.String(255), nullable=False)
    caption_ops45 = db.Column(db.Text(), nullable=False)

    ops46 = db.Column(db.SmallInteger, nullable=False)
    img_ops46 = db.Column(db.String(255), nullable=False)
    caption_ops46 = db.Column(db.Text(), nullable=False)

    ops47 = db.Column(db.SmallInteger, nullable=False)
    img_ops47 = db.Column(db.String(255), nullable=False)
    caption_ops47 = db.Column(db.Text(), nullable=False)

    ops48 = db.Column(db.SmallInteger, nullable=False)
    img_ops48 = db.Column(db.String(255), nullable=False)
    caption_ops48 = db.Column(db.Text(), nullable=False)

    ops49 = db.Column(db.SmallInteger, nullable=False)
    img_ops49 = db.Column(db.String(255), nullable=False)
    caption_ops49 = db.Column(db.Text(), nullable=False)

    ops50 = db.Column(db.SmallInteger, nullable=False)
    img_ops50 = db.Column(db.String(255), nullable=False)
    caption_ops50 = db.Column(db.Text(), nullable=False)

    ops51 = db.Column(db.SmallInteger, nullable=False)
    img_ops51 = db.Column(db.String(255), nullable=False)
    caption_ops51 = db.Column(db.Text(), nullable=False)

    ops52 = db.Column(db.SmallInteger, nullable=False)
    img_ops52 = db.Column(db.String(255), nullable=False)
    caption_ops52 = db.Column(db.Text(), nullable=False)

    # Battery electrolyte level
    FRBattery_electrolyte_level = db.Column(db.Float, nullable=False)
    RRBattery_electrolyte_level = db.Column(db.Float, nullable=False)
    FRBattery_statusOn = db.Column(db.String(100), nullable=False)
    RRBattery_statusOn = db.Column(db.String(100), nullable=False)
    FRBattery_voltage = db.Column(db.Float, nullable=False)
    RRBattery_voltage = db.Column(db.Float, nullable=False)

    # Fault codes
    FaultCode1 = db.Column(db.String(50), nullable=True)
    FaultCode2 = db.Column(db.String(50), nullable=True)
    FaultCode3 = db.Column(db.String(50), nullable=True)
    FaultCode4 = db.Column(db.String(50), nullable=True)
    FaultCode5 = db.Column(db.String(50), nullable=True)

    # Fault codes Status
    status1 = db.Column(db.Text(), nullable=True)
    status2 = db.Column(db.Text(), nullable=True)
    status3 = db.Column(db.Text(), nullable=True)
    status4 = db.Column(db.Text(), nullable=True)
    status5 = db.Column(db.Text(), nullable=True)

    # general remarks
    generalRemarks = db.Column(db.Text(), nullable=True)

    # created by and on
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False)