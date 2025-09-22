from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalChecklistItemModel_MA(db.Model):

    __tablename__ = 'Arrival_Manitou_items'
    
    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Arrival_Manitou_header.arrivalID'), nullable=False)

    # section of each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)
    
    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)
    
    # item status; Good, Bad, Missing
    status = db.Column(db.SmallInteger, nullable=True)
    
    # URL Path of the image
    image_url = db.Column(db.String(255), nullable=True)

    # for caption of the image
    caption = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<ArrivalChecklistItemModel_MA {self.arrivalID} Item: {self.itemName}>"