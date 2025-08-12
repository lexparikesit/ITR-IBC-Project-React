from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class MstAccesories(db.Model):
    
    __tablename__ = 'mstAccesories'

    AccesoriesID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    AccesoriesName = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        
        return f"<MstAccesories {self.AccesoriesName}>"
    
    def to_dict(self):
        
        data = {
            'AccesoriesID': str(self.AccesoriesID) if isinstance(self.AccesoriesID, uuid.UUID) else self.AccesoriesID,
            'AccesoriesName': self.AccesoriesName
        }
        
        return data