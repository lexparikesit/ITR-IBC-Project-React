from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER, NVARCHAR
import uuid

class IBC_Table(db.Model):

    __tablename__ = "IBC_Table"

    # primary key
    IBC_ID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Fields for header data
    IBC_No = db.Column(db.NVARCHAR(50), unique=True, nullable=False, index=True)
    Requestor = db.Column(db.String(100), nullable=False)
    IBC_date = db.Column(db.DateTime, nullable=False)
    PO_PJB = db.Column(db.String(50), nullable=False)
    Cust_ID = db.Column(db.String(100), nullable=False)
    Brand_ID = db.Column(db.String(10), nullable=False)
    UnitType = db.Column(db.String(50), nullable=False)
    QTY = db.Column(db.Integer, nullable=False)
    SiteOperation = db.Column(db.String(255), nullable=False)

    createdon = db.Column(db.DateTime, default=datetime.utcnow)
    createdby = db.Column(db.String(100), nullable=False)

    # relationship
    ibc_trans = db.relationship('IBC_Trans', backref='ibc_table', lazy=True)
    ibc_accessories = db.relationship('IBC_Accessories', backref='ibc_table', lazy=True)
    ibc_packages = db.relationship('IBC_Packages', backref='ibc_table', lazy=True)

    def __repr__(self):
        
        return f"<IBC_Table {self.IBC_No}>"

    def to_dict(self):
        
        data = {}
        
        for column in self.__table__.columns:
            value = getattr(self, column.name)
            if isinstance(value, uuid.UUID):
                data[column.name] = str(value)
            elif isinstance(value, datetime):
                data[column.name] = value.isoformat()
            else:
                data[column.name] = value
        
        return data

