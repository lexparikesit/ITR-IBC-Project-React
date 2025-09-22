from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalChecklistItemModel_RT(db.Model):

    __tablename__ = 'Arrival_Renault_items'
    
    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Arrival_Renault_header.arrivalID'), nullable=False)

    # section of each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)
    
    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)
    
    # item status; Good, Bad, Missing
    status = db.Column(db.Boolean, nullable=True)

    # for caption of the image
    remarks = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<ArrivalChecklistItemModel_RT {self.arrivalID} Item: {self.itemName}>"