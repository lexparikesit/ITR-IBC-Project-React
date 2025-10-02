from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class KHODocumentFormModel(db.Model):

    __tablename__ = 'KHO_unit_form'

    # primary key
    khoID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # unit Infomration
    dealerCode = db.Column(db.String(50), nullable=False)
    customer = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    typeModel = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False)
    bastDate = db.Column(db.DateTime, nullable=False)

    # docs URL
    pdfDocumentUrl = db.Column(db.String(255), nullable=False)

    # Metadata
    createdBy = db.Column(db.String(200), nullable=False)
    createdOn = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    def __repr__(self):
        return f"<KHODocumentFormModel {self.vinNumber}>"
