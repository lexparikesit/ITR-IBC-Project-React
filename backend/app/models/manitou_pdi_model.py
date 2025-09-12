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
    woNumber = db.Column(db.String(50), nullable=False)
    machineType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    deliveryDate = db.Column(db.DateTime, nullable=False)
    checkingDate = db.Column(db.DateTime, nullable=False)
    HourMeter = db.Column(db.Float, nullable=False)
    inspectorSignature = db.Column(db.String(100), nullable=False)
    approver = db.Column(db.String(100), nullable=False)
    customer = db.Column(db.String(255), nullable=False)

    # levels
    levels1 = db.Column(db.SmallInteger, nullable=False)
    img_levels1 = db.Column(db.String(255), nullable=True)
    caption_levels1 = db.Column(db.Text(), nullable=True)

    levels2 = db.Column(db.SmallInteger, nullable=False)
    img_levels2 = db.Column(db.String(255), nullable=True)
    caption_levels2 = db.Column(db.Text(), nullable=True)

    levels3 = db.Column(db.SmallInteger, nullable=False)
    img_levels3 = db.Column(db.String(255), nullable=True)
    caption_levels3 = db.Column(db.Text(), nullable=True)

    levels4 = db.Column(db.SmallInteger, nullable=False)
    img_levels4 = db.Column(db.String(255), nullable=True)
    caption_levels4 = db.Column(db.Text(), nullable=True)

    levels5 = db.Column(db.SmallInteger, nullable=False)
    img_levels5 = db.Column(db.String(255), nullable=True)
    caption_levels5 = db.Column(db.Text(), nullable=True)

    levels6 = db.Column(db.SmallInteger, nullable=False)
    img_levels6 = db.Column(db.String(255), nullable=True)
    caption_levels6 = db.Column(db.Text(), nullable=True)

    levels7 = db.Column(db.SmallInteger, nullable=False)
    img_levels7 = db.Column(db.String(255), nullable=True)
    caption_levels7 = db.Column(db.Text(), nullable=True)

    levels8 = db.Column(db.SmallInteger, nullable=False)
    img_levels8 = db.Column(db.String(255), nullable=True)
    caption_levels8 = db.Column(db.Text(), nullable=True)

    levels9 = db.Column(db.SmallInteger, nullable=False)
    img_levels9 = db.Column(db.String(255), nullable=True)
    caption_levels9 = db.Column(db.Text(), nullable=True)

    # visual inspection
    vis_inspection1 = db.Column(db.SmallInteger, nullable=False)
    img_vis_inspection1 = db.Column(db.String(255), nullable=True)
    caption_vis_inspection1 = db.Column(db.Text(), nullable=True)

    vis_inspection2 = db.Column(db.SmallInteger, nullable=False)
    img_vis_inspection2 = db.Column(db.String(255), nullable=True)
    caption_vis_inspection2 = db.Column(db.Text(), nullable=True)

    vis_inspection3 = db.Column(db.SmallInteger, nullable=False)
    img_vis_inspection3 = db.Column(db.String(255), nullable=True)
    caption_vis_inspection3 = db.Column(db.Text(), nullable=True)

    vis_inspection4 = db.Column(db.SmallInteger, nullable=False)
    img_vis_inspection4 = db.Column(db.String(255), nullable=True)
    caption_vis_inspection4 = db.Column(db.Text(), nullable=True)

    vis_inspection5 = db.Column(db.SmallInteger, nullable=False)
    img_vis_inspection5 = db.Column(db.String(255), nullable=True)
    caption_vis_inspection5 = db.Column(db.Text(), nullable=True)
    
    # operation
    ops1 = db.Column(db.SmallInteger, nullable=False)
    img_ops1 = db.Column(db.String(255), nullable=True)
    caption_ops1 = db.Column(db.Text(), nullable=True)

    ops2 = db.Column(db.SmallInteger, nullable=False)
    img_ops2 = db.Column(db.String(255), nullable=True)
    caption_ops2 = db.Column(db.Text(), nullable=True)

    ops3 = db.Column(db.SmallInteger, nullable=False)
    img_ops3 = db.Column(db.String(255), nullable=True)
    caption_ops3 = db.Column(db.Text(), nullable=True)

    # tests
    test1 = db.Column(db.SmallInteger, nullable=False)
    img_test1 = db.Column(db.String(255), nullable=True)
    caption_test1 = db.Column(db.Text(), nullable=True)

    test2 = db.Column(db.SmallInteger, nullable=False)
    img_test2 = db.Column(db.String(255), nullable=True)
    caption_test2 = db.Column(db.Text(), nullable=True)

    test3 = db.Column(db.SmallInteger, nullable=False)
    img_test3 = db.Column(db.String(255), nullable=True)
    caption_test3 = db.Column(db.Text(), nullable=True)

    test4 = db.Column(db.SmallInteger, nullable=False)
    img_test4 = db.Column(db.String(255), nullable=True)
    caption_test4 = db.Column(db.Text(), nullable=True)

    test5 = db.Column(db.SmallInteger, nullable=False)
    img_test5 = db.Column(db.String(255), nullable=True)
    caption_test5 = db.Column(db.Text(), nullable=True)

    test6 = db.Column(db.SmallInteger, nullable=False)
    img_test6 = db.Column(db.String(255), nullable=True)
    caption_test6 = db.Column(db.Text(), nullable=True)

    test7 = db.Column(db.SmallInteger, nullable=False)
    img_test7 = db.Column(db.String(255), nullable=True)
    caption_test7 = db.Column(db.Text(), nullable=True)

    test8 = db.Column(db.SmallInteger, nullable=False)
    img_test8 = db.Column(db.String(255), nullable=True)
    caption_test8 = db.Column(db.Text(), nullable=True)

    test9 = db.Column(db.SmallInteger, nullable=False)
    img_test9 = db.Column(db.String(255), nullable=True)
    caption_test9 = db.Column(db.Text(), nullable=True)

    test10 = db.Column(db.SmallInteger, nullable=False)
    img_test10 = db.Column(db.String(255), nullable=True)
    caption_test10 = db.Column(db.Text(), nullable=True)

    # general
    general1 = db.Column(db.SmallInteger, nullable=False)
    img_general1 = db.Column(db.String(255), nullable=True)
    caption_general1 = db.Column(db.Text(), nullable=True)

    general2 = db.Column(db.SmallInteger, nullable=False)
    img_general2 = db.Column(db.String(255), nullable=True)
    caption_general2 = db.Column(db.Text(), nullable=True)

    general3 = db.Column(db.SmallInteger, nullable=False)
    img_general3 = db.Column(db.String(255), nullable=True)
    caption_general3 = db.Column(db.Text(), nullable=True)

    general4 = db.Column(db.SmallInteger, nullable=False)
    img_general4 = db.Column(db.String(255), nullable=True)
    caption_general4 = db.Column(db.Text(), nullable=True)

    general5 = db.Column(db.SmallInteger, nullable=False)
    img_general5 = db.Column(db.String(255), nullable=True)
    caption_general5 = db.Column(db.Text(), nullable=True)

    # transports
    transport1 = db.Column(db.SmallInteger, nullable=False)
    img_transport1 = db.Column(db.String(255), nullable=True)
    caption_transport1 = db.Column(db.Text(), nullable=True)

    transport2 = db.Column(db.SmallInteger, nullable=False)
    img_transport2 = db.Column(db.String(255), nullable=True)
    caption_transport2 = db.Column(db.Text(), nullable=True)

    transport3 = db.Column(db.SmallInteger, nullable=False)
    img_transport3 = db.Column(db.String(255), nullable=True)
    caption_transport3 = db.Column(db.Text(), nullable=True)

    # remarks
    remarksTransport = db.Column(db.Text(), nullable=True)
    generalRemarks = db.Column(db.Text(), nullable=True)

    # created by and on
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


