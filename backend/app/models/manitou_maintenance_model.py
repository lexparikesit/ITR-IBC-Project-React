from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouMaintenanceModel(db.Model):

    __tablename__ = 'Storage_Manitou'
    
    # AC_ID as Primary Key (unique identifier)
    storageID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    woNumber = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    HM = db.Column(db.Float, nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # column engine
    engine1 = db.Column(db.SmallInteger, nullable=False)
    img_engine1 = db.Column(db.String(255), nullable=True)
    caption_engine1 = db.Column(db.Text(), nullable=True)

    engine2 = db.Column(db.SmallInteger, nullable=False)
    img_engine2 = db.Column(db.String(255), nullable=True)
    caption_engine2 = db.Column(db.Text(), nullable=True)

    engine3 = db.Column(db.SmallInteger, nullable=False)
    img_engine3 = db.Column(db.String(255), nullable=True)
    caption_engine3 = db.Column(db.Text(), nullable=True)

    engine4 = db.Column(db.SmallInteger, nullable=False)
    img_engine4 = db.Column(db.String(255), nullable=True)
    caption_engine4 = db.Column(db.Text(), nullable=True)

    engine5 = db.Column(db.SmallInteger, nullable=False)
    img_engine5 = db.Column(db.String(255), nullable=True)
    caption_engine5 = db.Column(db.Text(), nullable=True)

    engine6 = db.Column(db.SmallInteger, nullable=False)
    img_engine6 = db.Column(db.String(255), nullable=True)
    caption_engine6 = db.Column(db.Text(), nullable=True)

    engine7 = db.Column(db.SmallInteger, nullable=False)
    img_engine7 = db.Column(db.String(255), nullable=True)
    caption_engine7 = db.Column(db.Text(), nullable=True)

    # column driveline
    driveline1 = db.Column(db.SmallInteger, nullable=False)
    img_driveline1 = db.Column(db.String(255), nullable=True)
    caption_driveline1 = db.Column(db.Text(), nullable=True)

    driveline2 = db.Column(db.SmallInteger, nullable=False)
    img_driveline2 = db.Column(db.String(255), nullable=True)
    caption_driveline2 = db.Column(db.Text(), nullable=True)

    driveline3 = db.Column(db.SmallInteger, nullable=False)
    img_driveline3 = db.Column(db.String(255), nullable=True)
    caption_driveline3 = db.Column(db.Text(), nullable=True)

    driveline4 = db.Column(db.SmallInteger, nullable=False)
    img_driveline4 = db.Column(db.String(255), nullable=True)
    caption_driveline4 = db.Column(db.Text(), nullable=True)

    # column hydraulic
    hydraulic1 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic1 = db.Column(db.String(255), nullable=True)
    caption_hydraulic1 = db.Column(db.Text(), nullable=True)

    hydraulic2 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic2 = db.Column(db.String(255), nullable=True)
    caption_hydraulic2 = db.Column(db.Text(), nullable=True)

    hydraulic3 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic3 = db.Column(db.String(255), nullable=True)
    caption_hydraulic3 = db.Column(db.Text(), nullable=True)

    hydraulic4 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic4 = db.Column(db.String(255), nullable=True)
    caption_hydraulic4 = db.Column(db.Text(), nullable=True)

    hydraulic5 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic5 = db.Column(db.String(255), nullable=True)
    caption_hydraulic5 = db.Column(db.Text(), nullable=True)
    
    # column braking
    braking1 = db.Column(db.SmallInteger, nullable=False)
    img_braking1 = db.Column(db.String(255), nullable=True)
    caption_braking1 = db.Column(db.Text(), nullable=True)

    braking2 = db.Column(db.SmallInteger, nullable=False)
    img_braking2 = db.Column(db.String(255), nullable=True)
    caption_braking2 = db.Column(db.Text(), nullable=True)
    
    # column braking
    boom1 = db.Column(db.SmallInteger, nullable=False)
    img_boom1 = db.Column(db.String(255), nullable=True)
    caption_boom1 = db.Column(db.Text(), nullable=True)

    boom2 = db.Column(db.SmallInteger, nullable=False)
    img_boom2 = db.Column(db.String(255), nullable=True)
    caption_boom2 = db.Column(db.Text(), nullable=True)

    boom3 = db.Column(db.SmallInteger, nullable=False)
    img_boom3 = db.Column(db.String(255), nullable=True)
    caption_boom3 = db.Column(db.Text(), nullable=True)
    
    # column mast
    mast1 = db.Column(db.SmallInteger, nullable=False)
    img_mast1 = db.Column(db.String(255), nullable=True)
    caption_mast1 = db.Column(db.Text(), nullable=True)

    mast2 = db.Column(db.SmallInteger, nullable=False)
    img_mast2 = db.Column(db.String(255), nullable=True)
    caption_mast2 = db.Column(db.Text(), nullable=True)
    
    mast3 = db.Column(db.SmallInteger, nullable=False)
    img_mast3 = db.Column(db.String(255), nullable=True)
    caption_mast3 = db.Column(db.Text(), nullable=True)

    mast4 = db.Column(db.SmallInteger, nullable=False)
    img_mast4 = db.Column(db.String(255), nullable=True)
    caption_mast4 = db.Column(db.Text(), nullable=True)

    # column accessories
    acc1 = db.Column(db.SmallInteger, nullable=False)
    img_acc1 = db.Column(db.String(255), nullable=True)
    caption_acc1 = db.Column(db.Text(), nullable=True)

    acc2 = db.Column(db.SmallInteger, nullable=False)
    img_acc2 = db.Column(db.String(255), nullable=True)
    caption_acc2 = db.Column(db.Text(), nullable=True)

    acc3 = db.Column(db.SmallInteger, nullable=False)
    img_acc3 = db.Column(db.String(255), nullable=True)
    caption_acc3 = db.Column(db.Text(), nullable=True)

    # column cab
    cab1 = db.Column(db.SmallInteger, nullable=False)
    img_cab1 = db.Column(db.String(255), nullable=True)
    caption_cab1 = db.Column(db.Text(), nullable=True)

    cab2 = db.Column(db.SmallInteger, nullable=False)
    img_cab2 = db.Column(db.String(255), nullable=True)
    caption_cab2 = db.Column(db.Text(), nullable=True)

    cab3 = db.Column(db.SmallInteger, nullable=False)
    img_cab3 = db.Column(db.String(255), nullable=True)
    caption_cab3 = db.Column(db.Text(), nullable=True)

    cab4 = db.Column(db.SmallInteger, nullable=False)
    img_cab4 = db.Column(db.String(255), nullable=True)
    caption_cab4 = db.Column(db.Text(), nullable=True)

    cab5 = db.Column(db.SmallInteger, nullable=False)
    img_cab5 = db.Column(db.String(255), nullable=True)
    caption_cab5 = db.Column(db.Text(), nullable=True)

    cab6 = db.Column(db.SmallInteger, nullable=False)
    img_cab6 = db.Column(db.String(255), nullable=True)
    caption_cab6 = db.Column(db.Text(), nullable=True)

    cab7 = db.Column(db.SmallInteger, nullable=False)
    img_cab7 = db.Column(db.String(255), nullable=True)
    caption_cab7 = db.Column(db.Text(), nullable=True)

    cab8 = db.Column(db.SmallInteger, nullable=False)
    img_cab8 = db.Column(db.String(255), nullable=True)
    caption_cab8 = db.Column(db.Text(), nullable=True)

    cab9 = db.Column(db.SmallInteger, nullable=False)
    img_cab9 = db.Column(db.String(255), nullable=True)
    caption_cab9 = db.Column(db.Text(), nullable=True)

    cab10 = db.Column(db.SmallInteger, nullable=False)
    img_cab10 = db.Column(db.String(255), nullable=True)
    caption_cab10 = db.Column(db.Text(), nullable=True)

    # column wheels, screw, frame, paint
    wheels1 = db.Column(db.SmallInteger, nullable=False)
    img_wheels1 = db.Column(db.String(255), nullable=True)
    caption_wheels1 = db.Column(db.Text(), nullable=True)

    wheels2 = db.Column(db.SmallInteger, nullable=False)
    img_wheels2 = db.Column(db.String(255), nullable=True)
    caption_wheels2 = db.Column(db.Text(), nullable=True)

    screw = db.Column(db.SmallInteger, nullable=False)
    img_screw = db.Column(db.String(255), nullable=True)
    caption_screw = db.Column(db.Text(), nullable=True)

    frame1 = db.Column(db.SmallInteger, nullable=False)
    img_frame1 = db.Column(db.String(255), nullable=True)
    caption_frame1 = db.Column(db.Text(), nullable=True)

    frame2 = db.Column(db.SmallInteger, nullable=False)
    img_frame2 = db.Column(db.String(255), nullable=True)
    caption_frame2 = db.Column(db.Text(), nullable=True)

    paint = db.Column(db.SmallInteger, nullable=False)
    img_paint = db.Column(db.String(255), nullable=True)
    caption_paint = db.Column(db.Text(), nullable=True)

    # column general, operator, instruction
    general = db.Column(db.SmallInteger, nullable=False)
    img_general = db.Column(db.String(255), nullable=True)
    caption_general = db.Column(db.Text(), nullable=True)

    operator = db.Column(db.SmallInteger, nullable=False)
    img_operator = db.Column(db.String(255), nullable=True)
    caption_operator = db.Column(db.Text(), nullable=True)

    instruction = db.Column(db.SmallInteger, nullable=False)
    img_instruction = db.Column(db.String(255), nullable=True)
    caption_instruction = db.Column(db.Text(), nullable=True)

    # general remarks
    remarks = db.Column(db.Text(), nullable=True)

    # created by and on
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False)