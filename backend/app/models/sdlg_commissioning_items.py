from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class CommissioningChecklistItemModel_SDLG(db.Model):

    __tablename__ = 'Comm_Sdlg_items'

    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Foreign Key
    commID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Comm_Sdlg_header.commID'), nullable=False)

    # section of each items
    section = db.Column(db.String(100), nullable=False)
    
    # specificly item Name
    itemName = db.Column(db.String(100), nullable=False)
    
    # item checklist
    status = db.Column(db.Boolean, nullable=True)

    def __repr__(self):
        return f"<CommissioningChecklistItemModel_SDLG {self.ItemID} - {self.status}>"