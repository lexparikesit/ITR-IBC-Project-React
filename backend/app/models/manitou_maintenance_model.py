from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouMaintenanceModel(db.Model):

    __tablename__ = 'Storage_Manitou'
    
    # AC_ID as Primary Key (unique identifier)
    storageID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    HM = db.Column(db.Integer, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # column engine
    engine1 = db.Column(db.SmallInteger, nullable=False)
    engine2 = db.Column(db.SmallInteger, nullable=False)
    engine3 = db.Column(db.SmallInteger, nullable=False)
    engine4 = db.Column(db.SmallInteger, nullable=False)
    engine5 = db.Column(db.SmallInteger, nullable=False)
    engine6 = db.Column(db.SmallInteger, nullable=False)
    engine7 = db.Column(db.SmallInteger, nullable=False)

    # column driveline
    driveline1 = db.Column(db.SmallInteger, nullable=False)
    driveline2 = db.Column(db.SmallInteger, nullable=False)
    driveline3 = db.Column(db.SmallInteger, nullable=False)
    driveline4 = db.Column(db.SmallInteger, nullable=False)

    # column hydraulic
    hydraulic1 = db.Column(db.SmallInteger, nullable=False)
    hydraulic2 = db.Column(db.SmallInteger, nullable=False)
    hydraulic3 = db.Column(db.SmallInteger, nullable=False)
    hydraulic4 = db.Column(db.SmallInteger, nullable=False)
    hydraulic5 = db.Column(db.SmallInteger, nullable=False)
    
    # column braking
    braking1 = db.Column(db.SmallInteger, nullable=False)
    braking2 = db.Column(db.SmallInteger, nullable=False)
    
    # column braking
    boom1 = db.Column(db.SmallInteger, nullable=False)
    boom2 = db.Column(db.SmallInteger, nullable=False)
    boom3 = db.Column(db.SmallInteger, nullable=False)
    
    # column mast
    mast1 = db.Column(db.SmallInteger, nullable=False)
    mast2 = db.Column(db.SmallInteger, nullable=False)
    mast3 = db.Column(db.SmallInteger, nullable=False)
    mast4 = db.Column(db.SmallInteger, nullable=False)

    # column accessories
    acc1 = db.Column(db.SmallInteger, nullable=False)
    acc2 = db.Column(db.SmallInteger, nullable=False)
    acc3 = db.Column(db.SmallInteger, nullable=False)

    # column cab
    cab1 = db.Column(db.SmallInteger, nullable=False)
    cab2 = db.Column(db.SmallInteger, nullable=False)
    cab3 = db.Column(db.SmallInteger, nullable=False)
    cab4 = db.Column(db.SmallInteger, nullable=False)
    cab5 = db.Column(db.SmallInteger, nullable=False)
    cab6 = db.Column(db.SmallInteger, nullable=False)
    cab7 = db.Column(db.SmallInteger, nullable=False)
    cab8 = db.Column(db.SmallInteger, nullable=False)
    cab9 = db.Column(db.SmallInteger, nullable=False)
    cab10 = db.Column(db.SmallInteger, nullable=False)

    # column wheels, screw, frame, paint
    wheels1 = db.Column(db.SmallInteger, nullable=False)
    wheels2 = db.Column(db.SmallInteger, nullable=False)
    screw = db.Column(db.SmallInteger, nullable=False)
    frame1 = db.Column(db.SmallInteger, nullable=False)
    frame2 = db.Column(db.SmallInteger, nullable=False)
    paint = db.Column(db.SmallInteger, nullable=False)

    # column general, operator, instruction
    general = db.Column(db.SmallInteger, nullable=False)
    operator = db.Column(db.SmallInteger, nullable=False)
    instruction = db.Column(db.SmallInteger, nullable=False)

    # general remarks
    remarks = db.Column(db.String(500), nullable=True)

    # created by and on
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False)