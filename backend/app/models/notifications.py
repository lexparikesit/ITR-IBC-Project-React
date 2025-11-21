import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from app import db

class Notification(db.Model):
    __tablename__ = "IBC_Notifications"

    notification_id = db.Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    entity_id = db.Column(UNIQUEIDENTIFIER, nullable=False)
    entity_type = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    payload = db.Column(db.JSON)
    recipient_user_id = db.Column(UNIQUEIDENTIFIER, db.ForeignKey("IBC_Users.userid"), nullable=False)
    createdby = db.Column(db.String(150), nullable=False)
    createdon = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    is_read = db.Column(db.Boolean, default=False, nullable=False)
