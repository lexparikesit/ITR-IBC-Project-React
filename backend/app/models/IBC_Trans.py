from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, NVARCHAR
import uuid

class IBC_Trans(db.Model):

    __tablename__ = "IBC_Trans"

    # primary key
    IBC_TransID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    IBC_No = db.Column(db.NVARCHAR(50), db.ForeignKey('IBC_Table.IBC_No'), nullable=False)

    # Fields for transaction data
    VIN = db.Column(db.String(50), nullable=False)
    WO = db.Column(db.String(50), nullable=False)
    AttachmentType = db.Column(db.String(200), nullable=False)
    AttachmentSupplier = db.Column(db.String(150), nullable=False)
    DeliveryAddress = db.Column(db.String(150), nullable=False)
    DeliveryCustPIC = db.Column(db.String(100), nullable=False)
    DeliveryPlan = db.Column(db.DateTime, nullable=False)
    Remarks = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        
        return f"<IBC_Trans {self.VIN}>"

    def to_dict(self):
        
        data = {}
        
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, uuid.UUID):
                data[column.name] = str(value)
            elif isinstance(value, datetime):
                data[column.name] = value.isoformat()
            else:
                data[column.name] = value
        
        return data