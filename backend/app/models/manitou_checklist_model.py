from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouChecklistModel(db.Model):

    __tablename__ = 'Arrival_Manitou'
    
    # ArrivalID as Primary Key (unique identifier)
    ArrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    UnitType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    HourMeter = db.Column(db.Integer, nullable=False)
    ArrivalDate = db.Column(db.DateTime, nullable=False)
    Technician = db.Column(db.String(150), nullable=False)
    approvalBy = db.Column(db.String(150), nullable=False)

    # section engine with smallInteger
    engine1 = db.Column(db.SmallInteger, nullable=False)
    engine2 = db.Column(db.SmallInteger, nullable=False)
    engine3 = db.Column(db.SmallInteger, nullable=False)
    engine4 = db.Column(db.SmallInteger, nullable=False)
    engine5 = db.Column(db.SmallInteger, nullable=False)
    engine6 = db.Column(db.SmallInteger, nullable=False)
    engine7 = db.Column(db.SmallInteger, nullable=False)

    # section transmission with smallInteger
    transmission1 = db.Column(db.SmallInteger, nullable=False)
    transmission2 = db.Column(db.SmallInteger, nullable=False)
    transmission3 = db.Column(db.SmallInteger, nullable=False)
    transmission4 = db.Column(db.SmallInteger, nullable=False)

    # section axle with smallInteger
    axle1 = db.Column(db.SmallInteger, nullable=False)
    axle2 = db.Column(db.SmallInteger, nullable=False)

    # section hydraulic with smallInteger
    hydraulic1 = db.Column(db.SmallInteger, nullable=False)
    hydraulic2 = db.Column(db.SmallInteger, nullable=False)
    hydraulic3 = db.Column(db.SmallInteger, nullable=False)
    hydraulic4 = db.Column(db.SmallInteger, nullable=False)
    hydraulic5 = db.Column(db.SmallInteger, nullable=False)
    hydraulic6 = db.Column(db.SmallInteger, nullable=False)
    hydraulic7 = db.Column(db.SmallInteger, nullable=False)
    hydraulic8 = db.Column(db.SmallInteger, nullable=False)
    hydraulic9 = db.Column(db.SmallInteger, nullable=False)
    hydraulic10 = db.Column(db.SmallInteger, nullable=False)
    hydraulic11 = db.Column(db.SmallInteger, nullable=False)

    # section brake with smallInteger
    brake1 = db.Column(db.SmallInteger, nullable=False)
    brake2 = db.Column(db.SmallInteger, nullable=False)

    # section lub with smallInteger
    lub1 = db.Column(db.SmallInteger, nullable=False)

    # section boom with smallInteger
    boom1 = db.Column(db.SmallInteger, nullable=False)
    boom2 = db.Column(db.SmallInteger, nullable=False)
    boom3 = db.Column(db.SmallInteger, nullable=False)
    boom4 = db.Column(db.SmallInteger, nullable=False)
    boom5 = db.Column(db.SmallInteger, nullable=False)

    # mast section with smallInteger
    mast1 = db.Column(db.SmallInteger, nullable=False)
    mast2 = db.Column(db.SmallInteger, nullable=False)
    mast3 = db.Column(db.SmallInteger, nullable=False)
    mast4 = db.Column(db.SmallInteger, nullable=False)
    mast5 = db.Column(db.SmallInteger, nullable=False)

    # accessories section with smallInteger
    acc1 = db.Column(db.SmallInteger, nullable=False)
    acc2 = db.Column(db.SmallInteger, nullable=False)

    # cab section with smallInteger
    cab1 = db.Column(db.SmallInteger, nullable=False)
    cab2 = db.Column(db.SmallInteger, nullable=False)
    cab3 = db.Column(db.SmallInteger, nullable=False)
    cab4 = db.Column(db.SmallInteger, nullable=False)
    cab5 = db.Column(db.SmallInteger, nullable=False)
    cab6 = db.Column(db.SmallInteger, nullable=False)
    cab7 = db.Column(db.SmallInteger, nullable=False)
    cab8 = db.Column(db.SmallInteger, nullable=False)
    cab9 = db.Column(db.SmallInteger, nullable=False)
    cab10 = db.Column(db.SmallInteger, nullable=False)
    cab11 = db.Column(db.SmallInteger, nullable=False)

    # wheels section with smallInteger
    wheels1 = db.Column(db.SmallInteger, nullable=False)
    wheels2 = db.Column(db.SmallInteger, nullable=False)

    # single column with smallInteger for each section
    nuts = db.Column(db.SmallInteger, nullable=False)
    body = db.Column(db.SmallInteger, nullable=False)
    paint = db.Column(db.SmallInteger, nullable=False)
    general = db.Column(db.SmallInteger, nullable=False) 
    op_manual = db.Column(db.SmallInteger, nullable=False)
    instruction = db.Column(db.SmallInteger, nullable=False)

    # columns remarks with string type
    arrival_remarks = db.Column(db.String(500), nullable=False)
    createdby = db.Column(db.String(200), nullable=False)
    createdon = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):

        return f"<ManitouChecklistModel {self.VIN}>"
    
    def to_dict(self):

        data = {}

        for column in self.__table__.columns:
            
            value = getattr(self, column.name)
            
            if isinstance(value, uuid.UUID):
                data[column.name] = str(value)
            elif isinstance(value, datetime):
                data[column.name] = value.isoformat()
            elif isinstance(value, date):
                data[column.name] = value.strftime('%d-%m-%Y')
            else:
                data[column.name] = value
        
        return data
