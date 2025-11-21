from app.service.notifications_service import create_notifications

def send_notification(entity_id, entity_type, approver_ids, technician, extra_payload):
    """Helper function to create notifications for a given form object."""
    
    if not approver_ids:
        return
    
    message = f"{technician} has successfully submitted {entity_type.title()} Form"

    create_notifications(
        entity_type=entity_type,
        entity_id=entity_id,
        message=message,
        recipients=approver_ids,
        created_by=technician,
        payload=extra_payload,
    )