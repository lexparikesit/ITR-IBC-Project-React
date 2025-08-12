from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class MstPackages(db.Model):
    
    __tablename__ = 'mstPackages'
    
    PackagesID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    PackagesType = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        
        return f"<MstPackages {self.PackagesType}>"
    
    def to_dict(self):
        
        data = {
            'PackagesID': str(self.PackagesID) if isinstance(self.PackagesID, uuid.UUID) else self.PackagesID,
            'PackagesType': self.PackagesType,
        }
        
        return data