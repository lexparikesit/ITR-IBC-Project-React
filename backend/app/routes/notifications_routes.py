from flask import Blueprint, jsonify, request, g
from app.controllers.auth_controller import jwt_required
from app.schemas.notifications_schemas import notification_schema, notifications_schema
from app.service.notifications_service import list_notifications, mark_notification_read, mark_all_read 

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.get("")
@jwt_required
def get_notifications():
    """Get a list of notifications for the authenticated user, with optional filtering for unread notifications."""
    
    unread_only = request.args.get("unread", "false").lower() == "true"
    notifications = list_notifications(g.user_id, unread_only=unread_only)
    return jsonify({"data": notifications_schema.dump(notifications)})

@notifications_bp.patch("/<uuid:notification_id>")
@jwt_required
def update_notification(notification_id):
    """Mark a specific notification as read or unread."""
    
    payload = request.get_json(silent=True) or {}
    is_read = payload.get("is_read", True)
    notification = mark_notification_read(notification_id, is_read=is_read)
    return jsonify({"data": notification_schema.dump(notification)})

@notifications_bp.post("/mark-all-read")
@jwt_required
def mark_all_notifications():
    """Mark all notifications for the authenticated user as read."""
    
    mark_all_read(g.user_id)
    return jsonify({"message": "All notifications marked as read."}), 200
