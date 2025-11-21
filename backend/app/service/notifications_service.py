from datetime import datetime, timedelta, timezone
from app import db
from app.models.notifications import Notification

def create_notifications(entity_type, entity_id, message, recipients, created_by, payload=None):
    """Create notification objects and add them to the current session."""

    objects = [
        Notification(
            entity_type=entity_type,
            entity_id=entity_id,
            message=message,
            payload=payload,
            recipient_user_id=recipient,
            createdby=created_by,
        )
        for recipient in recipients
    ]

    if objects:
        db.session.add_all(objects)

    return objects

def list_notifications(user_id, unread_only=False):
    """List notifications for a specific user, optionally filtering for unread notifications only."""
    
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=7)
    
    query = (
        Notification.query.filter_by(recipient_user_id=user_id)
        .filter(Notification.createdon >= cutoff_date)
    )
    
    if unread_only:
        query = query.filter_by(is_read=False)
    return query.order_by(Notification.createdon.desc()).all()

def mark_notification_read(notification_id, is_read=True):
    """Mark a specific notification as read or unread."""
    
    notification = Notification.query.get_or_404(notification_id)
    notification.is_read = is_read
    db.session.commit()
    
    return notification

def mark_all_read(user_id):
    """Mark all notifications for a specific user as read."""
    
    Notification.query.filter_by(recipient_user_id=user_id, is_read=False).update(
        {"is_read": True}
    )
    
    db.session.commit()
