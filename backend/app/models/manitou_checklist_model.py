from app import db
from datetime import datetime, date
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
import uuid

class ManitouChecklistModel(db.Model):

    __tablename__ = 'Arrival_Manitou'
    
    # ArrivalID as Primary Key (unique identifier)
    ArrivalID = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)

    # Information Unit
    woNumber = db.Column(db.String(50), nullable=False)
    UnitType = db.Column(db.String(50), nullable=False)
    VIN = db.Column(db.String(50), nullable=False, unique=True)
    HourMeter = db.Column(db.Float, nullable=False)
    ArrivalDate = db.Column(db.DateTime, nullable=False)
    Technician = db.Column(db.String(200), nullable=False)
    approvalBy = db.Column(db.String(200), nullable=False)

    # section engine with smallInteger
    engine1 = db.Column(db.SmallInteger, nullable=False)
    img_engine1 = db.Column(db.String(255), nullable=True)
    caption_engine1 = db.Column(db.Text(), nullable=True)

    engine2 = db.Column(db.SmallInteger, nullable=False)
    img_engine2 = db.Column(db.String(255), nullable=True)
    caption_engine2 = db.Column(db.Text(), nullable=True)

    engine3 = db.Column(db.SmallInteger, nullable=False)
    img_engine3 = db.Column(db.String(255), nullable=True)
    caption_engine3 = db.Column(db.Text(), nullable=True)

    engine4 = db.Column(db.SmallInteger, nullable=False)
    img_engine4 = db.Column(db.String(255), nullable=True)
    caption_engine4 = db.Column(db.Text(), nullable=True)

    engine5 = db.Column(db.SmallInteger, nullable=False)
    img_engine5 = db.Column(db.String(255), nullable=True)
    caption_engine5 = db.Column(db.Text(), nullable=True)

    engine6 = db.Column(db.SmallInteger, nullable=False)
    img_engine6 = db.Column(db.String(255), nullable=True)
    caption_engine6 = db.Column(db.Text(), nullable=True)

    engine7 = db.Column(db.SmallInteger, nullable=False)
    img_engine7 = db.Column(db.String(255), nullable=True)
    caption_engine7 = db.Column(db.Text(), nullable=True)

    # section transmission with smallInteger
    transmission1 = db.Column(db.SmallInteger, nullable=False)
    img_trans1 = db.Column(db.String(255), nullable=True)
    caption_trans1 = db.Column(db.Text(), nullable=True)

    transmission2 = db.Column(db.SmallInteger, nullable=False)
    img_trans2 = db.Column(db.String(255), nullable=True)
    caption_trans2 = db.Column(db.Text(), nullable=True)

    transmission3 = db.Column(db.SmallInteger, nullable=False)
    img_trans3 = db.Column(db.String(255), nullable=True)
    caption_trans3 = db.Column(db.Text(), nullable=True)

    transmission4 = db.Column(db.SmallInteger, nullable=False)
    img_trans4 = db.Column(db.String(255), nullable=True)
    caption_trans4 = db.Column(db.Text(), nullable=True)

    # section axle with smallInteger
    axle1 = db.Column(db.SmallInteger, nullable=False)
    img_axle1 = db.Column(db.String(255), nullable=True)
    caption_axle1 = db.Column(db.Text(), nullable=True)

    axle2 = db.Column(db.SmallInteger, nullable=False)
    img_axle2 = db.Column(db.String(255), nullable=True)
    caption_axle2 = db.Column(db.Text(), nullable=True)

    # section hydraulic with smallInteger
    hydraulic1 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic1 = db.Column(db.String(255), nullable=True)
    caption_hydraulic1 = db.Column(db.Text(), nullable=True)

    hydraulic2 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic2 = db.Column(db.String(255), nullable=True)
    caption_hydraulic2 = db.Column(db.Text(), nullable=True)

    hydraulic3 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic3 = db.Column(db.String(255), nullable=True)
    caption_hydraulic3 = db.Column(db.Text(), nullable=True)

    hydraulic4 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic4 = db.Column(db.String(255), nullable=True)
    caption_hydraulic4 = db.Column(db.Text(), nullable=True)

    hydraulic5 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic5 = db.Column(db.String(255), nullable=True)
    caption_hydraulic5 = db.Column(db.Text(), nullable=True)

    hydraulic6 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic6 = db.Column(db.String(255), nullable=True)
    caption_hydraulic6 = db.Column(db.Text(), nullable=True)

    hydraulic7 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic7 = db.Column(db.String(255), nullable=True)
    caption_hydraulic7 = db.Column(db.Text(), nullable=True)

    hydraulic8 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic8 = db.Column(db.String(255), nullable=True)
    caption_hydraulic8 = db.Column(db.Text(), nullable=True)

    hydraulic9 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic9 = db.Column(db.String(255), nullable=True)
    caption_hydraulic9 = db.Column(db.Text(), nullable=True)

    hydraulic10 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic10 = db.Column(db.String(255), nullable=True)
    caption_hydraulic10 = db.Column(db.Text(), nullable=True)

    hydraulic11 = db.Column(db.SmallInteger, nullable=False)
    img_hydraulic11 = db.Column(db.String(255), nullable=True)
    caption_hydraulic11 = db.Column(db.Text(), nullable=True)

    # section brake with smallInteger
    brake1 = db.Column(db.SmallInteger, nullable=False)
    img_brake1 = db.Column(db.String(255), nullable=True)
    caption_brake1 = db.Column(db.Text(), nullable=True)

    brake2 = db.Column(db.SmallInteger, nullable=False)
    img_brake2 = db.Column(db.String(255), nullable=True)
    caption_brake2 = db.Column(db.Text(), nullable=True)

    # section lub with smallInteger
    lub = db.Column(db.SmallInteger, nullable=False)
    img_lub = db.Column(db.String(255), nullable=True)
    caption_lub = db.Column(db.Text(), nullable=True)

    # section boom with smallInteger
    boom1 = db.Column(db.SmallInteger, nullable=False)
    img_boom1 = db.Column(db.String(255), nullable=True)
    caption_boom1 = db.Column(db.Text(), nullable=True)

    boom2 = db.Column(db.SmallInteger, nullable=False)
    img_boom2 = db.Column(db.String(255), nullable=True)
    caption_boom2 = db.Column(db.Text(), nullable=True)

    boom3 = db.Column(db.SmallInteger, nullable=False)
    img_boom3 = db.Column(db.String(255), nullable=True)
    caption_boom3 = db.Column(db.Text(), nullable=True)

    boom4 = db.Column(db.SmallInteger, nullable=False)
    img_boom4 = db.Column(db.String(255), nullable=True)
    caption_boom4 = db.Column(db.Text(), nullable=True)

    boom5 = db.Column(db.SmallInteger, nullable=False)
    img_boom5 = db.Column(db.String(255), nullable=True)
    caption_boom5 = db.Column(db.Text(), nullable=True)

    # mast section with smallInteger
    mast1 = db.Column(db.SmallInteger, nullable=False)
    img_mast1 = db.Column(db.String(255), nullable=True)
    caption_mast1 = db.Column(db.Text(), nullable=True)

    mast2 = db.Column(db.SmallInteger, nullable=False)
    img_mast2 = db.Column(db.String(255), nullable=True)
    caption_mast2 = db.Column(db.Text(), nullable=True)

    mast3 = db.Column(db.SmallInteger, nullable=False)
    img_mast3 = db.Column(db.String(255), nullable=True)
    caption_mast3 = db.Column(db.Text(), nullable=True)

    mast4 = db.Column(db.SmallInteger, nullable=False)
    img_mast4 = db.Column(db.String(255), nullable=True)
    caption_mast4 = db.Column(db.Text(), nullable=True)

    mast5 = db.Column(db.SmallInteger, nullable=False)
    img_mast5 = db.Column(db.String(255), nullable=True)
    caption_mast5 = db.Column(db.Text(), nullable=True)

    # accessories section with smallInteger
    acc1 = db.Column(db.SmallInteger, nullable=False)
    img_acc1 = db.Column(db.String(255), nullable=True)
    caption_acc1 = db.Column(db.Text(), nullable=True)

    acc2 = db.Column(db.SmallInteger, nullable=False)
    img_acc2 = db.Column(db.String(255), nullable=True)
    caption_acc2 = db.Column(db.Text(), nullable=True)

    # cab section with smallInteger
    cab1 = db.Column(db.SmallInteger, nullable=False)
    img_cab1 = db.Column(db.String(255), nullable=True)
    caption_cab1 = db.Column(db.Text(), nullable=True)

    cab2 = db.Column(db.SmallInteger, nullable=False)
    img_cab2 = db.Column(db.String(255), nullable=True)
    caption_cab2 = db.Column(db.Text(), nullable=True)

    cab3 = db.Column(db.SmallInteger, nullable=False)
    img_cab3 = db.Column(db.String(255), nullable=True)
    caption_cab3 = db.Column(db.Text(), nullable=True)

    cab4 = db.Column(db.SmallInteger, nullable=False)
    img_cab4 = db.Column(db.String(255), nullable=True)
    caption_cab4 = db.Column(db.Text(), nullable=True)

    cab5 = db.Column(db.SmallInteger, nullable=False)
    img_cab5 = db.Column(db.String(255), nullable=True)
    caption_cab5 = db.Column(db.Text(), nullable=True)

    cab6 = db.Column(db.SmallInteger, nullable=False)
    img_cab6 = db.Column(db.String(255), nullable=True)
    caption_cab6 = db.Column(db.Text(), nullable=True)

    cab7 = db.Column(db.SmallInteger, nullable=False)
    img_cab7 = db.Column(db.String(255), nullable=True)
    caption_cab7 = db.Column(db.Text(), nullable=True)

    cab8 = db.Column(db.SmallInteger, nullable=False)
    img_cab8 = db.Column(db.String(255), nullable=True)
    caption_cab8 = db.Column(db.Text(), nullable=True)

    cab9 = db.Column(db.SmallInteger, nullable=False)
    img_cab9 = db.Column(db.String(255), nullable=True)
    caption_cab9 = db.Column(db.Text(), nullable=True)

    cab10 = db.Column(db.SmallInteger, nullable=False)
    img_cab10 = db.Column(db.String(255), nullable=True)
    caption_cab10 = db.Column(db.Text(), nullable=True)

    cab11 = db.Column(db.SmallInteger, nullable=False)
    img_cab11 = db.Column(db.String(255), nullable=True)
    caption_cab11 = db.Column(db.Text(), nullable=True)

    # wheels section with smallInteger
    wheels1 = db.Column(db.SmallInteger, nullable=False)
    img_wheels1 = db.Column(db.String(255), nullable=True)
    caption_wheels1 = db.Column(db.Text(), nullable=True)

    wheels2 = db.Column(db.SmallInteger, nullable=False)
    img_wheels2 = db.Column(db.String(255), nullable=True)
    caption_wheels2 = db.Column(db.Text(), nullable=True)

    # single column with smallInteger for each section
    nuts = db.Column(db.SmallInteger, nullable=False)
    img_nuts = db.Column(db.String(255), nullable=True)
    caption_nuts = db.Column(db.Text(), nullable=True)

    body = db.Column(db.SmallInteger, nullable=False)
    img_body = db.Column(db.String(255), nullable=True)
    caption_body = db.Column(db.Text(), nullable=True)

    paint = db.Column(db.SmallInteger, nullable=False)
    img_paint = db.Column(db.String(255), nullable=True)
    caption_paint = db.Column(db.Text(), nullable=True)

    general = db.Column(db.SmallInteger, nullable=False)
    img_general = db.Column(db.String(255), nullable=True)
    caption_general = db.Column(db.Text(), nullable=True)

    op_manual = db.Column(db.SmallInteger, nullable=False)
    img_op_manual = db.Column(db.String(255), nullable=True)
    caption_op_manual = db.Column(db.Text(), nullable=True)

    instruction = db.Column(db.SmallInteger, nullable=False)
    img_instruction = db.Column(db.String(255), nullable=True)
    caption_instruction = db.Column(db.Text(), nullable=True)

    # columns remarks with string type
    arrival_remarks = db.Column(db.Text(), nullable=False)
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
