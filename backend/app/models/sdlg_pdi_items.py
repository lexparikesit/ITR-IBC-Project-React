from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class PDIChecklistItemModel_SDLG(db.Model):

    __tablename__ = 'PDI_Sdlg_items'

    # primary key
    itemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    pdiID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('PDI_Sdlg_header.pdiID'), nullable=False)

    # items detail
    itemName = db.Column(db.String(100), nullable=False)

    # status
    status = db.Column(db.Boolean(), nullable=True)

    def __repr__(self):
        return f"<PDI_SDLG_Item(id='{self.itemID}', pdiID='{self.pdiID}', item='{self.itemName}')>"