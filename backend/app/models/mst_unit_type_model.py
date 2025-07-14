from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class MstUnitType(db.Model):
    
    __tablename__ = 'mstTypeUnit'
    
    TypeID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    BrandID = db.Column(db.String(5), nullable=True)
    Type = db.Column(db.String(255), nullable=True)
    Desc = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        
        return f"<MstUnitType {self.Type}>"
    
    def to_dict(self):
        
        # convert object model to dictionary to return as JSON
        data = {
            'TypeID': str(self.TypeID) if isinstance(self.TypeID, uuid.UUID) else self.TypeID,
            'BrandID': self.BrandID,
            'Type': self.Type,
            'Desc': self.Desc
        }

        return data