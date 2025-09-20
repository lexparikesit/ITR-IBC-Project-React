from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class RenaultChecklistModel(db.Model):

    __tablename__ = 'Arrival_Renault'
    
    # AC_ID as Primary Key (unique identifier)
    AC_ID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    brand = db.Column(db.String(50), nullable=False)
    woNumber = db.Column(db.String(50), nullable=False)
    UnitType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    EngineNo = db.Column(db.String(50), nullable=False)
    chassisNumber = db.Column(db.String(50), nullable=False)
    arrivalDate = db.Column(db.Date, nullable=False)
    technician = db.Column(db.String(255), nullable=False)
    approvalBy = db.Column(db.String(255), nullable=False)

    # column cab1 with bit type
    Cab1 = db.Column(db.Boolean, nullable=False)
    Cab2 = db.Column(db.Boolean, nullable=False)
    Cab3 = db.Column(db.Boolean, nullable=False)
    Cab4 = db.Column(db.Boolean, nullable=False)
    Cab5 = db.Column(db.Boolean, nullable=False)
    Cab6 = db.Column(db.Boolean, nullable=False)
    Cab7 = db.Column(db.Boolean, nullable=False)
    Cab8 = db.Column(db.Boolean, nullable=False)

    # column remarks with remarks
    Cab1Remark = db.Column(db.Text(), nullable=True)
    Cab2Remark = db.Column(db.Text(), nullable=True)
    Cab3Remark = db.Column(db.Text(), nullable=True)
    Cab4Remark = db.Column(db.Text(), nullable=True)
    Cab5Remark = db.Column(db.Text(), nullable=True)
    Cab6Remark = db.Column(db.Text(), nullable=True)
    Cab7Remark = db.Column(db.Text(), nullable=True)
    Cab8Remark = db.Column(db.Text(), nullable=True)

    # column axle with bit type
    Axle1 = db.Column(db.Boolean, nullable=False)
    Axle2 = db.Column(db.Boolean, nullable=False)
    Axle3 = db.Column(db.Boolean, nullable=False)
    Axle4 = db.Column(db.Boolean, nullable=False)

    # column axle with remarks
    Axle1Remark = db.Column(db.Text(), nullable=True)
    Axle2Remark = db.Column(db.Text(), nullable=True)
    Axle3Remark = db.Column(db.Text(), nullable=True)
    Axle4Remark = db.Column(db.Text(), nullable=True)

    # column battery with bit type
    Battery1 = db.Column(db.Boolean, nullable=False)
    Battery2 = db.Column(db.Boolean, nullable=False)

    # column battery with remarks
    Battery1Remark = db.Column(db.Text(), nullable=True)
    Battery2Remark = db.Column(db.Text(), nullable=True)

    # column electrical with bit type
    Electrical1 = db.Column(db.Boolean, nullable=False)
    Electrical2 = db.Column(db.Boolean, nullable=False)
    Electrical3 = db.Column(db.Boolean, nullable=False)
    Electrical4 = db.Column(db.Boolean, nullable=False)
    Electrical5 = db.Column(db.Boolean, nullable=False)
    Electrical6 = db.Column(db.Boolean, nullable=False)
    
    # column electrical with remarks
    Electrical1Remark = db.Column(db.Text(), nullable=True)
    Electrical2Remark = db.Column(db.Text(), nullable=True)
    Electrical3Remark = db.Column(db.Text(), nullable=True)
    Electrical4Remark = db.Column(db.Text(), nullable=True)
    Electrical5Remark = db.Column(db.Text(), nullable=True)
    Electrical6Remark = db.Column(db.Text(), nullable=True)

    # column equipment with bit type
    Equipment1 = db.Column(db.Boolean, nullable=False)
    Equipment2 = db.Column(db.Boolean, nullable=False)
    Equipment3 = db.Column(db.Boolean, nullable=False)
    
    # column equipment with remarks
    Equipment1Remark = db.Column(db.Text(), nullable=True)
    Equipment2Remark = db.Column(db.Text(), nullable=True)
    Equipment3Remark = db.Column(db.Text(), nullable=True)

    # column functional with bit type
    Functional1 = db.Column(db.Boolean, nullable=False)
    Functional2 = db.Column(db.Boolean, nullable=False)
    Functional3 = db.Column(db.Boolean, nullable=False)
    Functional4 = db.Column(db.Boolean, nullable=False)

    # column functional with remarks
    Functional1Remark = db.Column(db.Text(), nullable=True)
    Functional2Remark = db.Column(db.Text(), nullable=True)
    Functional3Remark = db.Column(db.Text(), nullable=True)
    Functional4Remark = db.Column(db.Text(), nullable=True)

    # column arrival remarks
    arrival_remarks = db.Column(db.Text(), nullable=False)

    # column for Created By and Created On
    createdon = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    createdby = db.Column(db.String(50), nullable=False)

    def __repr__(self):

        return f"<RenaultChecklistModel {self.VIN}>"
    
    def to_dict(self):

        data = {}

        for column in self.__table__.columns:
            value = getattr(self, column.name)

            # convert the uuid to string
            if isinstance(value, uuid.UUID):
                data[column.name] = str(value)
            else:
                data[column.name] = value
        
        return data
