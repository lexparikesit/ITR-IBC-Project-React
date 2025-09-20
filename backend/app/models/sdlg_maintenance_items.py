from app import db
from datetime import datetime
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class MaintenanceChecklistItemModel_SDLG(db.Model):

    __tablename__ = 'Maintenance_Sdlg_items'

    # primary key
    itemID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # foreign key
    smID = db.Column(UNIQUEIDENTIFIER, db.ForeignKey('Maintenance_Sdlg_header.smID'), nullable=False)

    # items detail
    itemName = db.Column(db.String(100), nullable=False)

    # status
    status = db.Column(db.Boolean(), nullable=True)

    def __repr__(self):
        return f"<MaintenanceChecklistItemModel_SDLG {self.smID} Item: {self.itemName}>"

