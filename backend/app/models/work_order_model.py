from app import db
from datetime import datetime
import uuid

class WorkOrderView(db.Model):

    __tablename__ = 'IBC_WorkOrder'

    CASEID = db.Column(db.String(255), primary_key=True)
    GROUPID = db.Column(db.String(255))
    DEVICEID = db.Column(db.String(255))
    CUSTACCOUNT = db.Column(db.String(255))
    DISPLAYVALUE = db.Column(db.String(255))