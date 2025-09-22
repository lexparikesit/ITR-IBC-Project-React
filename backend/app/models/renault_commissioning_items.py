from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class CommissioningChecklistItemModel_RT(db.Model):

    __tablename__ = 'Comm_Renault_items'

    # Primary Key
    ItemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Foreign Key
    commID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Comm_Renault_header.commID'), nullable=False)

    # section for each item; engine, transmission, cab
    section = db.Column(db.String(100), nullable=False)

    # specificly item Name; engine1, engine2, etc
    itemName = db.Column(db.String(100), nullable=False)

    # item checklist
    checklist = db.Column(db.Boolean, nullable=True, default=True)

    # for Notes
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<CommissioningChecklistItemModel_RT {self.ItemID} - {self.checklist}>"
