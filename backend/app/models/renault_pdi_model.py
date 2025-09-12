from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class RenaultPDIModel(db.Model):

    __tablename__ = 'PDI_Renault'

    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # information unit
    Date = db.Column(db.DateTime, nullable=False) 
    woNumber = db.Column(db.String(50), nullable=False)
    mileage = db.Column(db.Float, nullable=False)
    chassisID = db.Column(db.String(50), nullable=False)
    registrationNo = db.Column(db.String(50), nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(300), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    engine = db.Column(db.String(50), nullable=False)
    technicians = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # checklist Lubrication, oil and fluid levels
    lub1 = db.Column(db.SmallInteger, nullable=False)
    img_lub1 = db.Column(db.String(255), nullable=False)
    caption_lub1 = db.Column(db.Text(), nullable=False)

    lub2 = db.Column(db.SmallInteger, nullable=False)
    img_lub2 = db.Column(db.String(255), nullable=False)
    caption_lub2 = db.Column(db.Text(), nullable=False)

    lub3 = db.Column(db.SmallInteger, nullable=False)
    img_lub3 = db.Column(db.String(255), nullable=False)
    caption_lub3 = db.Column(db.Text(), nullable=False)

    lub4 = db.Column(db.SmallInteger, nullable=False)
    img_lub4 = db.Column(db.String(255), nullable=False)
    caption_lub4 = db.Column(db.Text(), nullable=False)

    lub5 = db.Column(db.SmallInteger, nullable=False)
    img_lub5 = db.Column(db.String(255), nullable=False)
    caption_lub5 = db.Column(db.Text(), nullable=False)

    lub6 = db.Column(db.SmallInteger, nullable=False)
    img_lub6 = db.Column(db.String(255), nullable=False)
    caption_lub6 = db.Column(db.Text(), nullable=False)

    lub7 = db.Column(db.SmallInteger, nullable=False)
    img_lub7 = db.Column(db.String(255), nullable=False)
    caption_lub7 = db.Column(db.Text(), nullable=False)

    lub8 = db.Column(db.SmallInteger, nullable=False)
    img_lub8 = db.Column(db.String(255), nullable=False)
    caption_lub8 = db.Column(db.Text(), nullable=False)

    lub9 = db.Column(db.SmallInteger, nullable=False)
    img_lub9 = db.Column(db.String(255), nullable=False)
    caption_lub9 = db.Column(db.Text(), nullable=False)

    lub10 = db.Column(db.SmallInteger, nullable=False)
    img_lub10 = db.Column(db.String(255), nullable=False)
    caption_lub10 = db.Column(db.Text(), nullable=False)

    # checklist cab
    cab1 = db.Column(db.SmallInteger, nullable=False)
    img_cab1 = db.Column(db.String(255), nullable=False)
    caption_cab1 = db.Column(db.Text(), nullable=False)

    cab2 = db.Column(db.SmallInteger, nullable=False)
    img_cab2 = db.Column(db.String(255), nullable=False)
    caption_cab2 = db.Column(db.Text(), nullable=False)

    cab3 = db.Column(db.SmallInteger, nullable=False)
    img_cab3 = db.Column(db.String(255), nullable=False)
    caption_cab3 = db.Column(db.Text(), nullable=False)

    cab4 = db.Column(db.SmallInteger, nullable=False)
    img_cab4 = db.Column(db.String(255), nullable=False)
    caption_cab4 = db.Column(db.Text(), nullable=False)

    cab5 = db.Column(db.SmallInteger, nullable=False)
    img_cab5 = db.Column(db.String(255), nullable=False)
    caption_cab5 = db.Column(db.Text(), nullable=False)

    cab6 = db.Column(db.SmallInteger, nullable=False)
    img_cab6 = db.Column(db.String(255), nullable=False)
    caption_cab6 = db.Column(db.Text(), nullable=False)

    cab7 = db.Column(db.SmallInteger, nullable=False)
    img_cab7 = db.Column(db.String(255), nullable=False)
    caption_cab7 = db.Column(db.Text(), nullable=False)

    # checklist exterior
    ext1 = db.Column(db.SmallInteger, nullable=False)
    img_ext1 = db.Column(db.String(255), nullable=False)
    caption_ext1 = db.Column(db.Text(), nullable=False)

    ext2 = db.Column(db.SmallInteger, nullable=False)
    img_ext2 = db.Column(db.String(255), nullable=False)
    caption_ext2 = db.Column(db.Text(), nullable=False)

    ext3 = db.Column(db.SmallInteger, nullable=False)
    img_ext3 = db.Column(db.String(255), nullable=False)
    caption_ext3 = db.Column(db.Text(), nullable=False)

    ext4 = db.Column(db.SmallInteger, nullable=False)
    img_ext4 = db.Column(db.String(255), nullable=False)
    caption_ext4 = db.Column(db.Text(), nullable=False)

    ext5 = db.Column(db.SmallInteger, nullable=False)
    img_ext5 = db.Column(db.String(255), nullable=False)
    caption_ext5 = db.Column(db.Text(), nullable=False)

    ext6 = db.Column(db.SmallInteger, nullable=False)
    img_ext6 = db.Column(db.String(255), nullable=False)
    caption_ext6 = db.Column(db.Text(), nullable=False)

    ext7 = db.Column(db.SmallInteger, nullable=False)
    img_ext7 = db.Column(db.String(255), nullable=False)
    caption_ext7 = db.Column(db.Text(), nullable=False)

    # checklist under vehicle
    under1 = db.Column(db.SmallInteger, nullable=False)
    img_under1 = db.Column(db.String(255), nullable=False)
    caption_under1 = db.Column(db.Text(), nullable=False)

    under2 = db.Column(db.SmallInteger, nullable=False)
    img_under2 = db.Column(db.String(255), nullable=False)
    caption_under2 = db.Column(db.Text(), nullable=False)

    under3 = db.Column(db.SmallInteger, nullable=False)
    img_under3 = db.Column(db.String(255), nullable=False)
    caption_under3 = db.Column(db.Text(), nullable=False)

    # checklist test drive
    test_drive1 = db.Column(db.SmallInteger, nullable=False)
    img_test_drive1 = db.Column(db.String(255), nullable=False)
    caption_test_drive1 = db.Column(db.Text(), nullable=False)

    test_drive2 = db.Column(db.SmallInteger, nullable=False)
    img_test_drive2 = db.Column(db.String(255), nullable=False)
    caption_test_drive2 = db.Column(db.Text(), nullable=False)

    test_drive3 = db.Column(db.SmallInteger, nullable=False)
    img_test_drive3 = db.Column(db.String(255), nullable=False)
    caption_test_drive3 = db.Column(db.Text(), nullable=False)

    # checklist finish
    finish1 = db.Column(db.SmallInteger, nullable=False)
    img_finish1 = db.Column(db.String(255), nullable=False)
    caption_finish1 = db.Column(db.Text(), nullable=False)

    finish2 = db.Column(db.SmallInteger, nullable=False)
    img_finish2 = db.Column(db.String(255), nullable=False)
    caption_finish2 = db.Column(db.Text(), nullable=False)

    finish3 = db.Column(db.SmallInteger, nullable=False)
    img_finish2 = db.Column(db.String(255), nullable=False)
    caption_finish2 = db.Column(db.Text(), nullable=False)

    # checklist battery status
    batt_inner_front = db.Column(db.String(100), nullable=False)
    batt_outer_rear = db.Column(db.String(100), nullable=False)
    test_code_batt_inner_front = db.Column(db.String(100), nullable=False)
    test_code_batt_outer_rear = db.Column(db.String(100), nullable=False)

    # checklist others fields
    vehicle_inspection = db.Column(db.Text(), nullable=False)

    createdBy = db.Column(db.String(100), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        
        return f"<PDIRenault(pdiID='{self.pdiID}', WO='{self.WO}')>"