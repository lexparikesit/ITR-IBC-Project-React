from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class PDIChecklistItemModel_RT(db.Model):

    __tablename__ = 'PDI_Renault_items'

    # primary key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    pdiID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('PDI_Renault_header.pdiID'), nullable=False)

    # section for each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)

    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)

    # item status
    status = db.Column(db.SmallInteger, nullable=True)

    # URL Path of the image
    image_blob_name = db.Column(db.Text(), nullable=True)

    # for caption of the image
    caption = db.Column(db.Text(), nullable=True)

    # specificly for value
    value = db.Column(db.String(100), nullable=True)

    def __repr__(self):
        return f"<PDIItem(id='{self.ItemID}', pdiID='{self.pdiID}', item='{self.itemName}')>"