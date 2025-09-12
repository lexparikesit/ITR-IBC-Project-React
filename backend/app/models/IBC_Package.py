from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, NVARCHAR
import uuid

class IBC_Packages(db.Model):
    
    __tablename__ = 'IBC_Packages'
    
    # Primary Key
    IBC_PackagesID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    IBC_No = db.Column(db.NVARCHAR(50), db.ForeignKey('IBC_Table.IBC_No'), nullable=False)
    
    # Fields for package data
    PackagesType = db.Column(db.String(50), nullable=False)
    PackageDesc = db.Column(db.String(500))
    
    def __repr__(self):
        
        return f"<IBC_Packages {self.PackagesType}>"

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