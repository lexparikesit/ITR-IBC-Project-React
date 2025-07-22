from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class RenaultChecklistModel(db.Model):

    __tablename__ = 'Arrival_Renault'
    
    # AC_ID as Primary Key (unique identifier)
    AC_ID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    UnitType = db.Column(db.String(50), nullable=True)
    VIN = db.Column(db.String(50), nullable=True)
    EngineNo = db.Column(db.String(50), nullable=True)
    chassisNumber = db.Column(db.String(50), nullable=True)

    # column cab1 with bit type
    Cab1 = db.Column(db.Boolean, nullable=True)
    Cab2 = db.Column(db.Boolean, nullable=True)
    Cab3 = db.Column(db.Boolean, nullable=True)
    Cab4 = db.Column(db.Boolean, nullable=True)
    Cab5 = db.Column(db.Boolean, nullable=True)
    Cab6 = db.Column(db.Boolean, nullable=True)
    Cab7 = db.Column(db.Boolean, nullable=True)
    Cab8 = db.Column(db.Boolean, nullable=True)

    # column remarks with remarks
    Cab1Remark = db.Column(db.String(150), nullable=True)
    Cab2Remark = db.Column(db.String(150), nullable=True)
    Cab3Remark = db.Column(db.String(150), nullable=True)
    Cab4Remark = db.Column(db.String(150), nullable=True)
    Cab5Remark = db.Column(db.String(150), nullable=True)
    Cab6Remark = db.Column(db.String(150), nullable=True)
    Cab7Remark = db.Column(db.String(150), nullable=True)
    Cab8Remark = db.Column(db.String(150), nullable=True)

    # column axle with bit type
    Axle1 = db.Column(db.Boolean, nullable=True)
    Axle2 = db.Column(db.Boolean, nullable=True)
    Axle3 = db.Column(db.Boolean, nullable=True)
    Axle4 = db.Column(db.Boolean, nullable=True)

    # column axle with remarks
    Axle1Remark = db.Column(db.String(150), nullable=True)
    Axle2Remark = db.Column(db.String(150), nullable=True)
    Axle3Remark = db.Column(db.String(150), nullable=True)
    Axle4Remark = db.Column(db.String(150), nullable=True)

    # column battery with bit type
    Battery1 = db.Column(db.Boolean, nullable=True)
    Battery2 = db.Column(db.Boolean, nullable=True)

    # column battery with remarks
    Battery1Remark = db.Column(db.String(150), nullable=True)
    Battery2Remark = db.Column(db.String(150), nullable=True)

    # column electrical with bit type
    Electrical1 = db.Column(db.Boolean, nullable=True)
    Electrical2 = db.Column(db.Boolean, nullable=True)
    Electrical3 = db.Column(db.Boolean, nullable=True)
    Electrical4 = db.Column(db.Boolean, nullable=True)
    Electrical5 = db.Column(db.Boolean, nullable=True)
    Electrical6 = db.Column(db.Boolean, nullable=True)
    
    # column electrical with remarks
    Electrical1Remark = db.Column(db.String(150), nullable=True)
    Electrical2Remark = db.Column(db.String(150), nullable=True)
    Electrical3Remark = db.Column(db.String(150), nullable=True)
    Electrical4Remark = db.Column(db.String(150), nullable=True)
    Electrical5Remark = db.Column(db.String(150), nullable=True)
    Electrical6Remark = db.Column(db.String(150), nullable=True)

    # column equipment with bit type
    Equipment1 = db.Column(db.Boolean, nullable=True)
    Equipment2 = db.Column(db.Boolean, nullable=True)
    Equipment3 = db.Column(db.Boolean, nullable=True)
    
    # column equipment with remarks
    Equipment1Remark = db.Column(db.String(150), nullable=True)
    Equipment2Remark = db.Column(db.String(150), nullable=True)
    Equipment3Remark = db.Column(db.String(150), nullable=True)

    # column functional with bit type
    Functional1 = db.Column(db.Boolean, nullable=True)
    Functional2 = db.Column(db.Boolean, nullable=True)
    Functional3 = db.Column(db.Boolean, nullable=True)
    Functional4 = db.Column(db.Boolean, nullable=True)

    # column functional with remarks
    Functional1Remark = db.Column(db.String(150), nullable=True)
    Functional2Remark = db.Column(db.String(150), nullable=True)
    Functional3Remark = db.Column(db.String(150), nullable=True)
    Functional4Remark = db.Column(db.String(150), nullable=True)

    # column arrival remarks
    arrival_remarks = db.Column(db.String(500), nullable=True)

    # column for Created By and Created On
    createdon = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    createdby = db.Column(db.String(50), nullable=False)

    # column for created Date Check
    arrivalDate = db.Column(db.Date, nullable=True)

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
