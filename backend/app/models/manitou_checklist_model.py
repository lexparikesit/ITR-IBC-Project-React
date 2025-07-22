from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouChecklistModel(db.Model):

    __tablename__ = 'Arrival_Manitou'
    
    # ArrivalID as Primary Key (unique identifier)
    ArrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    UnitType = db.Column(db.String(50), nullable=True)
    VIN = db.Column(db.String(50), nullable=True)
    HourMeter = db.Column(db.Integer, nullable=True)
    ArrivalDate = db.Column(db.DateTime, nullable=True)
    Technician = db.Column(db.String(150), nullable=True)

    # section engine with smallInteger
    engine1 = db.Column(db.SmallInteger, nullable=True)
    engine2 = db.Column(db.SmallInteger, nullable=True)
    engine3 = db.Column(db.SmallInteger, nullable=True)
    engine4 = db.Column(db.SmallInteger, nullable=True)
    engine5 = db.Column(db.SmallInteger, nullable=True)
    engine6 = db.Column(db.SmallInteger, nullable=True)
    engine7 = db.Column(db.SmallInteger, nullable=True)

    # section transmission with smallInteger
    transmission1 = db.Column(db.SmallInteger, nullable=True)
    transmission2 = db.Column(db.SmallInteger, nullable=True)
    transmission3 = db.Column(db.SmallInteger, nullable=True)
    transmission4 = db.Column(db.SmallInteger, nullable=True)

    # section axle with smallInteger
    axle1 = db.Column(db.SmallInteger, nullable=True)
    axle2 = db.Column(db.SmallInteger, nullable=True)

    # section hydraulic with smallInteger
    hydraulic1 = db.Column(db.SmallInteger, nullable=True)
    hydraulic2 = db.Column(db.SmallInteger, nullable=True)
    hydraulic3 = db.Column(db.SmallInteger, nullable=True)
    hydraulic4 = db.Column(db.SmallInteger, nullable=True)
    hydraulic5 = db.Column(db.SmallInteger, nullable=True)
    hydraulic6 = db.Column(db.SmallInteger, nullable=True)
    hydraulic7 = db.Column(db.SmallInteger, nullable=True)
    hydraulic8 = db.Column(db.SmallInteger, nullable=True)
    hydraulic9 = db.Column(db.SmallInteger, nullable=True)
    hydraulic10 = db.Column(db.SmallInteger, nullable=True)
    hydraulic11 = db.Column(db.SmallInteger, nullable=True)

    # section brake with smallInteger
    brake1 = db.Column(db.SmallInteger, nullable=True)
    brake2 = db.Column(db.SmallInteger, nullable=True)

    # section lub with smallInteger
    lub1 = db.Column(db.SmallInteger, nullable=True)

    # section boom with smallInteger
    boom1 = db.Column(db.SmallInteger, nullable=True)
    boom2 = db.Column(db.SmallInteger, nullable=True)
    boom3 = db.Column(db.SmallInteger, nullable=True)
    boom4 = db.Column(db.SmallInteger, nullable=True)
    boom5 = db.Column(db.SmallInteger, nullable=True)

    # mast section with smallInteger
    mast1 = db.Column(db.SmallInteger, nullable=True)
    mast2 = db.Column(db.SmallInteger, nullable=True)
    mast3 = db.Column(db.SmallInteger, nullable=True)
    mast4 = db.Column(db.SmallInteger, nullable=True)
    mast5 = db.Column(db.SmallInteger, nullable=True)

    # accessories section with smallInteger
    acc1 = db.Column(db.SmallInteger, nullable=True)
    acc2 = db.Column(db.SmallInteger, nullable=True)

    # cab section with smallInteger
    cab1 = db.Column(db.SmallInteger, nullable=True)
    cab2 = db.Column(db.SmallInteger, nullable=True)
    cab3 = db.Column(db.SmallInteger, nullable=True)
    cab4 = db.Column(db.SmallInteger, nullable=True)
    cab5 = db.Column(db.SmallInteger, nullable=True)
    cab6 = db.Column(db.SmallInteger, nullable=True)
    cab7 = db.Column(db.SmallInteger, nullable=True)
    cab8 = db.Column(db.SmallInteger, nullable=True)
    cab9 = db.Column(db.SmallInteger, nullable=True)
    cab10 = db.Column(db.SmallInteger, nullable=True)
    cab11 = db.Column(db.SmallInteger, nullable=True)

    # wheels section with smallInteger
    wheels1 = db.Column(db.SmallInteger, nullable=True)
    wheels2 = db.Column(db.SmallInteger, nullable=True)

    # single column with smallInteger for each section
    nuts = db.Column(db.SmallInteger, nullable=True)
    body = db.Column(db.SmallInteger, nullable=True)
    paint = db.Column(db.SmallInteger, nullable=True)
    general = db.Column(db.SmallInteger, nullable=True) 
    op_manual = db.Column(db.SmallInteger, nullable=True)
    instruction = db.Column(db.SmallInteger, nullable=True)

    # columns remarks with string type
    arrival_remarks = db.Column(db.String(500), nullable=True)
    createdby = db.Column(db.String(200), nullable=True)
    createdon = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)

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
