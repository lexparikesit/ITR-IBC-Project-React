from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, NVARCHAR
import uuid

class IBC_Accessories(db.Model):

    __tablename__ = "IBC_Accessories"

    # primary key
    IBC_AccessoriesID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    IBC_No = db.Column(db.NVARCHAR(50), db.ForeignKey('IBC_Table.IBC_No'), nullable=False)

    # Fields for accessories data
    IBC_Accessories = db.Column(db.String(50), nullable=False)
    Remarks = db.Column(db.Text())

    def __repr__(self):
        
        return f"<IBC_Accessories {self.IBC_Accessories}>"

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