from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class StorageMaintenanceChecklistItemModel_RT(db.Model):

    __tablename__ = 'Maintenance_Renault_items'

    # primary key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    smID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Maintenance_Renault_header.smID'), nullable=False)

    # section for each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)

    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)

    # item status
    status = db.Column(db.SmallInteger, nullable=False)

    # value (value for voltage, electrolyte level, etc)
    value = db.Column(db.Float, nullable=True)

    # item code (fault code)
    code = db.Column(db.String(50), nullable=True)

    # URL Path of the image
    image_url = db.Column(db.String(255), nullable=True)

    # for caption of the image
    caption = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<StorageMaintenanceItemModel_RT FormID: {self.smID} Item: {self.itemName}>"