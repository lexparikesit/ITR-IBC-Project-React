from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class StorageMaintenanceChecklistItemModel_MA(db.Model):

    __tablename__ = 'Maintenance_Manitou_items'

    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    
    # Foreign Key
    smID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Maintenance_Manitou_header.smID'), nullable=False)

    # section of each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)
    
    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)
    
    # item status; Good, Bad, Missing
    status = db.Column(db.SmallInteger, nullable=True)
    
    # URL Path of the image
    image_blob_name = db.Column(db.Text(), nullable=True)

    # for caption of the image
    caption = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<StorageMaintenanceFormModel_MA {self.smID} Item: {self.itemName}>"