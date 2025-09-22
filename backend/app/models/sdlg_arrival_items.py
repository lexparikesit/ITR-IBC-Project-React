from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ArrivalChecklistItemModel_SDLG(db.Model):

    __tablename__ = 'Arrival_Sdlg_items'

    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Foreign Key
    arrivalID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Arrival_Sdlg_header.arrivalID'), nullable=False)

    # Checklist Item Details
    ItemName = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Boolean, nullable=True)
    remarks = db.Column(db.Text(), nullable=True)

    def __repr__(self):
        return f"<ArrivalChecklistItemModel_SDLG {self.ItemName}>"