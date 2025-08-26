from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class RenaultPDIModel(db.Model):

    __tablename__ = 'PDI_Renault'

    pdiID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # information unit
    Date = db.Column(db.DateTime, nullable=False) 
    WO = db.Column(db.String(50), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    chassisID = db.Column(db.String(50), nullable=False)
    registrationNo = db.Column(db.String(50), nullable=False)
    customer = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(300), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    engine = db.Column(db.String(50), nullable=False)
    technicians = db.Column(db.String(100), nullable=False)
    approvalBy = db.Column(db.String(100), nullable=False)

    # checklist Lubrication, oil and fluid levels
    lub1 = db.Column(db.SmallInteger, nullable=False)
    lub2 = db.Column(db.SmallInteger, nullable=False)
    lub3 = db.Column(db.SmallInteger, nullable=False)
    lub4 = db.Column(db.SmallInteger, nullable=False)
    lub5 = db.Column(db.SmallInteger, nullable=False)
    lub6 = db.Column(db.SmallInteger, nullable=False)
    lub7 = db.Column(db.SmallInteger, nullable=False)
    lub8 = db.Column(db.SmallInteger, nullable=False)
    lub9 = db.Column(db.SmallInteger, nullable=False)
    lub10 = db.Column(db.SmallInteger, nullable=False)

    # checklist cab
    cab1 = db.Column(db.SmallInteger, nullable=False)
    cab2 = db.Column(db.SmallInteger, nullable=False)
    cab3 = db.Column(db.SmallInteger, nullable=False)
    cab4 = db.Column(db.SmallInteger, nullable=False)
    cab5 = db.Column(db.SmallInteger, nullable=False)
    cab6 = db.Column(db.SmallInteger, nullable=False)
    cab7 = db.Column(db.SmallInteger, nullable=False)

    # checklist exterior
    ext1 = db.Column(db.SmallInteger, nullable=False)
    ext2 = db.Column(db.SmallInteger, nullable=False)
    ext3 = db.Column(db.SmallInteger, nullable=False)
    ext4 = db.Column(db.SmallInteger, nullable=False)
    ext5 = db.Column(db.SmallInteger, nullable=False)
    ext6 = db.Column(db.SmallInteger, nullable=False)
    ext7 = db.Column(db.SmallInteger, nullable=False)

    # checklist under vehicle
    under1 = db.Column(db.SmallInteger, nullable=False)
    under2 = db.Column(db.SmallInteger, nullable=False)
    under3 = db.Column(db.SmallInteger, nullable=False)

    # checklist test drive
    test_drive1 = db.Column(db.SmallInteger, nullable=False)
    test_drive2 = db.Column(db.SmallInteger, nullable=False)
    test_drive3 = db.Column(db.SmallInteger, nullable=False)

    # checklist finish
    finish1 = db.Column(db.SmallInteger, nullable=False)
    finish2 = db.Column(db.SmallInteger, nullable=False)
    finish3 = db.Column(db.SmallInteger, nullable=False)

    # checklist battery status
    batt_inner_front = db.Column(db.String(100), nullable=False)
    batt_outer_rear = db.Column(db.String(100), nullable=False)
    test_code_batt_inner_front = db.Column(db.String(100), nullable=False)
    test_code_batt_outer_rear = db.Column(db.String(100), nullable=False)

    # checklist others fields
    vehicle_inspection = db.Column(db.Text, nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    createdBy = db.Column(db.String(100), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<PDIRenault(pdiID='{self.pdiID}', WO='{self.WO}')>"