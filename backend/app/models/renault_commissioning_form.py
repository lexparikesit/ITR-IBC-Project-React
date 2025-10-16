from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class CommissioningFormModel_RT(db.Model):

    __tablename__ = 'Comm_Renault_header'

    # Primary Key
    commID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # report Information
    jobCardNo = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    dealerCode = db.Column(db.String(50), nullable=False)
    dateOfCheck = db.Column(db.DateTime, nullable=False)
    technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # unit Information
    brand = db.Column(db.String(50), nullable=False)
    typeModel = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    CAM = db.Column(db.String(100), nullable=False)
    FAB_no = db.Column(db.String(100), nullable=False)
    deliveryDate = db.Column(db.DateTime, nullable=False)

    # customer Information
    customer = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    contactPerson = db.Column(db.String(255), nullable=False)
    application = db.Column(db.String(255), nullable=False)
    reg_fleet_no = db.Column(db.String(50), nullable=False)
    
    # signature information
    inspectorSignature = db.Column(db.String(200), nullable=False)
    inspectorSignatureDate = db.Column(db.DateTime, nullable=False)
    supervisorSignature = db.Column(db.String(200), nullable=False)
    supervisorSignatureDate = db.Column(db.DateTime, nullable=False)

    # metadata
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, nullable=False)

    # relational with others Table
    major_components = db.relationship('MajorComponent_RT', backref='form', lazy=True)
    items = db.relationship('CommissioningChecklistItemModel_RT', backref='form', lazy=True)

    def __repr__(self):
        return f"<CommissioningFormModel_RT {self.VIN}>"

class MajorComponent_RT(db.Model):

    __tablename__ = 'Comm_Renault_major_component'

    # Primary Key
    majorID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Foreign Key
    commID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Comm_Renault_header.commID'), nullable=False)

    # section of components
    component = db.Column(db.String(255), nullable=False)

    # section of make column
    make = db.Column(db.String(255), nullable=True) 

    # section of type model
    type_model = db.Column(db.String(255), nullable=True)

    # section of serial number
    serial_number = db.Column(db.String(255), nullable=True)

    # section of part number
    part_number = db.Column(db.String(255), nullable=True)

    # remarks
    remarks = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<MajorComponent_RT {self.component} for form {self.commID}>"