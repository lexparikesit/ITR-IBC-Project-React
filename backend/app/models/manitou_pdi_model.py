from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouPDI(db.Model):
    
    __tablename__ = 'PDI_Manitou'

    # pdi ID
    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # information unit
    dealerCode = db.Column(db.String(10), nullable=False)
    machineType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    deliveryDate = db.Column(db.DateTime, nullable=False)
    checkingDate = db.Column(db.DateTime, nullable=False)
    HourMeter = db.Column(db.Float, nullable=False)
    inspectorSignature = db.Column(db.String(100), nullable=False)
    approver = db.Column(db.String(100), nullable=False)
    customer = db.Column(db.String(250), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)

    # levels
    levels1 = db.Column(db.SmallInteger, nullable=False)
    levels2 = db.Column(db.SmallInteger, nullable=False)
    levels3 = db.Column(db.SmallInteger, nullable=False)
    levels4 = db.Column(db.SmallInteger, nullable=False)
    levels5 = db.Column(db.SmallInteger, nullable=False)
    levels6 = db.Column(db.SmallInteger, nullable=False)
    levels7 = db.Column(db.SmallInteger, nullable=False)
    levels8 = db.Column(db.SmallInteger, nullable=False)
    levels9 = db.Column(db.SmallInteger, nullable=False)

    # visual inspection
    vis_inspection1 = db.Column(db.SmallInteger, nullable=False)
    vis_inspection2 = db.Column(db.SmallInteger, nullable=False)
    vis_inspection3 = db.Column(db.SmallInteger, nullable=False)
    vis_inspection4 = db.Column(db.SmallInteger, nullable=False)
    vis_inspection5 = db.Column(db.SmallInteger, nullable=False)
    
    # operation
    ops1 = db.Column(db.SmallInteger, nullable=False)
    ops2 = db.Column(db.SmallInteger, nullable=False)
    ops3 = db.Column(db.SmallInteger, nullable=False)

    # tests
    test1 = db.Column(db.SmallInteger, nullable=False)
    test2 = db.Column(db.SmallInteger, nullable=False)
    test3 = db.Column(db.SmallInteger, nullable=False)
    test4 = db.Column(db.SmallInteger, nullable=False)
    test5 = db.Column(db.SmallInteger, nullable=False)
    test6 = db.Column(db.SmallInteger, nullable=False)
    test7 = db.Column(db.SmallInteger, nullable=False)
    test8 = db.Column(db.SmallInteger, nullable=False)
    test9 = db.Column(db.SmallInteger, nullable=False)
    test10 = db.Column(db.SmallInteger, nullable=False)

    # general
    general1 = db.Column(db.SmallInteger, nullable=False)
    general2 = db.Column(db.SmallInteger, nullable=False)
    general3 = db.Column(db.SmallInteger, nullable=False)
    general4 = db.Column(db.SmallInteger, nullable=False)
    general5 = db.Column(db.SmallInteger, nullable=False)

    # transports
    transport1 = db.Column(db.SmallInteger, nullable=False)
    transport2 = db.Column(db.SmallInteger, nullable=False)
    transport3 = db.Column(db.SmallInteger, nullable=False)

    # remarks
    remarksTransport = db.Column(db.String(500), nullable=True)
    generalRemarks = db.Column(db.String(500), nullable=True)

    # created by and on
    createdBy = db.Column(db.String(100), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


