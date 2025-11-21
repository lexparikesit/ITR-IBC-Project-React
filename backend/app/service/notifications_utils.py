import uuid
from typing import Iterable, List, Sequence, Set
from flask import current_app, g
from sqlalchemy import literal
from app import db, socketio
from app.models.models import IBCRoles, IBCUserRoles, User
from app.models.mst_unit_type_model import MstUnitType
from app.schemas.notifications_schemas import notification_schema
from app.service.notifications_service import create_notifications

DEFAULT_SUPERVISION_ROLES = [
    "Salesman",
    "Product Head",
    "Technical Head",
    "General Manager - Chief Officer",
    "Super Admin",
    "Supervisor",
]

BRAND_DISPLAY_MAP = {
    "renault": "Renault Trucks",
    "renault trucks": "Renault Trucks",
    "rt": "Renault Trucks",
    "manitou": "Manitou",
    "ma": "Manitou",
    "sdlg": "SDLG",
    "kalmar": "Kalmar",
    "ka": "Kalmar",
    "mantsinen": "Mantsinen",
    "mtn": "Mantsinen",
}

_MODEL_CACHE: dict[str, str] = {}

def normalize_recipient_ids(raw_value):
    """Normalize raw recipient IDs into a list of UUIDs."""

    if not raw_value:
        return []

    raw_list = raw_value if isinstance(raw_value, list) else [raw_value]
    recipients = []

    for item in raw_list:
        candidate = item.get("value") if isinstance(item, dict) else item

        if not candidate:
            continue

        try:
            recipients.append(uuid.UUID(str(candidate)))
        except (ValueError, TypeError):
            current_app.logger.warning("Skip notif recipient: %s", candidate)

    return recipients


def build_payload(entry, fields):
    """Construct a payload dictionary from an entry object based on specified fields."""

    payload = {field: getattr(entry, field, None) for field in fields}

    return {k: v for k, v in payload.items() if v is not None}

def _get_user_display_name(user: User) -> str:
    """Get the display name for a user."""

    if user is None:
        return ""

    full_name = f"{user.firstName or ''} {user.lastName or ''}".strip()
    
    return full_name or user.username or str(user.userid)

def resolve_user_names(raw_value: Iterable) -> List[str]:
    """Resolve ApprovalBy raw values into display names."""

    if isinstance(raw_value, list) and all(isinstance(val, uuid.UUID) for val in raw_value):
        recipient_ids = raw_value
    else:
        recipient_ids = normalize_recipient_ids(raw_value)
    
    if not recipient_ids:
        return []

    users = (
        User.query.filter(User.userid.in_(recipient_ids)).all()
        if recipient_ids
        else []
    )
    
    user_lookup = {user.userid: _get_user_display_name(user) for user in users}

    resolved_names = []
    
    for recipient_id in recipient_ids:
        name = user_lookup.get(recipient_id)
        
        if name:
            resolved_names.append(name)

    return resolved_names

def get_user_ids_by_roles(role_names: Sequence[str]) -> Set[uuid.UUID]:
    """Return unique user IDs who belong to any of the provided roles."""

    if not role_names:
        return set()

    rows = (
        db.session.query(User.userid)
        .join(IBCUserRoles, IBCUserRoles.userid == User.userid)
        .join(IBCRoles, IBCRoles.role_id == IBCUserRoles.role_id)
        .filter(IBCRoles.role_name.in_(role_names))
        .filter(User.is_active == literal(1))
        .all()
    )

    return {row.userid for row in rows if row and row.userid}

def _format_form_descriptor(payload: dict) -> str:
    """Format a descriptor string for a form based on its payload."""

    brand = payload.get("brandLabel") or payload.get("brand") or "-"
    wo_number = payload.get("woNumber") or payload.get("wo_number") or "-"
    model = payload.get("modelLabel") or payload.get("model") or payload.get("UnitType") or payload.get("typeModel") or "-"
    vin = payload.get("VIN") or payload.get("vin") or "-"

    return f"{brand}, WO {wo_number}, Model {model}, VIN {vin}"


def format_brand_label(brand_value):
    """Format a brand label from various input formats."""
    
    if not brand_value:
        return "-"
    normalized = str(brand_value).strip().lower()
    
    return BRAND_DISPLAY_MAP.get(normalized, str(brand_value).title())

def resolve_model_label(model_value):
    """Resolve a model label from various input formats."""
    
    if not model_value:
        return "-"

    value_str = str(model_value)
    cached = _MODEL_CACHE.get(value_str)
    
    if cached:
        return cached

    try:
        model_uuid = uuid.UUID(value_str)
        record = MstUnitType.query.filter_by(TypeID=model_uuid).first()
        
        if record and record.Type:
            _MODEL_CACHE[value_str] = record.Type
            return record.Type
    
    except (ValueError, TypeError):
        pass

    _MODEL_CACHE[value_str] = value_str
    return value_str


def resolve_user_display_name(identifier):
    """Resolve a user display name from various identifier formats."""
    
    if not identifier:
        return ""

    if isinstance(identifier, dict):
        return identifier.get("label") or identifier.get("name") or identifier.get("username") or ""

    value_str = str(identifier)
    
    try:
        user_uuid = uuid.UUID(value_str)
        user = User.query.filter_by(userid=user_uuid).first()
        
        if user:
            return _get_user_display_name(user)
    
    except (ValueError, TypeError):
        pass

    return value_str

def _emit_notifications(notifications):
    """Emit notifications via Socket.IO."""
    
    for notif in notifications or []:
        try:
            data = notification_schema.dump(notif)
            room = str(notif.recipient_user_id)
            socketio.emit("notification:new", data, room=room)
        
        except Exception as emit_error:
            current_app.logger.exception(f"Failed to emit notification {notif.notification_id}: {emit_error}")

def emit_notifications(notifications):
    """Public helper to emit notifications after a successful commit."""
    
    _emit_notifications(notifications)

def dispatch_notification(
    *,
    entity_type,
    entity_id,
    approval_raw,
    technician=None,
    payload=None,
    notify_roles=None,
    technician_raw=None,
    exclude_submitter_roles=False,
):
    """Create notifications for approvers and supervisory roles."""

    payload = payload or {}
    
    # normalize brand/model labels
    brand_label = format_brand_label(payload.get("brand"))
    payload.setdefault("brandLabel", brand_label)
    
    model_candidate = (
        payload.get("model")
        or payload.get("modelLabel")
        or payload.get("UnitType")
        or payload.get("typeModel")
    )
    payload.setdefault("modelLabel", resolve_model_label(model_candidate))

    submitter_id = getattr(g, "user_id", None)
    submitter_uuid = None
    
    if submitter_id:
        try:
            submitter_uuid = uuid.UUID(str(submitter_id))
        except (ValueError, TypeError):
            submitter_uuid = None

    created_notifications = []
    raw_sender = technician or getattr(g, "user_name", None) or "System"
    sender_display = resolve_user_display_name(raw_sender) or raw_sender
    payload.setdefault("submitterName", sender_display)
    technician_display = resolve_user_display_name(technician_raw) if technician_raw else ""
    
    if technician_raw:
        payload.setdefault("technicianName", technician_display or sender_display)
    else:
        payload.pop("technicianName", None)
    
    entity_type_lower = entity_type.lower()
    entity_label = "IBC" if entity_type_lower.startswith("ibc") else entity_type.replace("_", " ").title()
    form_descriptor = _format_form_descriptor(payload)

    approver_recipient_ids = normalize_recipient_ids(approval_raw)
    if submitter_uuid:
        approver_recipient_ids = [rid for rid in approver_recipient_ids if rid != submitter_uuid]
    approver_names = resolve_user_names(approver_recipient_ids if approver_recipient_ids else approval_raw)
    approver_label = ", ".join(approver_names) if approver_names else ""

    # Approver notifications
    if approver_recipient_ids:
        approver_message = (
            f"{sender_display} attached you as an Approver of {entity_label} - {form_descriptor}"
        )
        
        created = create_notifications(
            entity_type=entity_type,
            entity_id=entity_id,
            message=approver_message,
            recipients=approver_recipient_ids,
            created_by=sender_display,
            payload=payload,
        )
        created_notifications.extend(created)

    # Supervisory role broadcasts
    supervisory_roles = notify_roles or []
    role_recipient_ids = list(get_user_ids_by_roles(supervisory_roles))
    if submitter_uuid and exclude_submitter_roles:
        role_recipient_ids = [rid for rid in role_recipient_ids if rid != submitter_uuid]
    
    if role_recipient_ids:
        payload.setdefault("approverName", approver_label)
        descriptor_label = (
            f" IBC No: {payload.get('IBC_No') or '-'} - Brand: {payload.get('brandLabel') or payload.get('brand') or '-'}"
            if entity_type_lower.startswith("ibc")
            else f" - {form_descriptor}"
        )
        broadcast_message = (
            f"Form submission of {entity_label}{descriptor_label} - done by {sender_display}"
        )
        
        if approver_label:
            broadcast_message += f" and approved by {approver_label}"
        
        created = create_notifications(
            entity_type=entity_type,
            entity_id=entity_id,
            message=broadcast_message,
            recipients=list(role_recipient_ids),
            created_by=sender_display,
            payload=payload,
        )
        created_notifications.extend(created)

    technician_recipient_ids = normalize_recipient_ids(technician_raw)
    
    if submitter_uuid:
        technician_recipient_ids = [rid for rid in technician_recipient_ids if rid != submitter_uuid]
    
    if technician_recipient_ids and (technician_display or sender_display) and technician_display != sender_display:
        payload.setdefault("technicianName", technician_display or sender_display)
        descriptor_label = (
            f" IBC No: {payload.get('IBC_No') or '-'} - Brand: {payload.get('brandLabel') or payload.get('brand') or '-'}"
            if entity_type_lower.startswith("ibc")
            else f" - {form_descriptor}"
        )
        technician_message = (
            f"{sender_display} selected you as the Technician of {entity_label}{descriptor_label}"
        )
        
        if approver_label:
            technician_message += f" with approver {approver_label}"
        
        created = create_notifications(
            entity_type=entity_type,
            entity_id=entity_id,
            message=technician_message,
            recipients=list(technician_recipient_ids),
            created_by=sender_display,
            payload=payload,
        )
        created_notifications.extend(created)

    return created_notifications
