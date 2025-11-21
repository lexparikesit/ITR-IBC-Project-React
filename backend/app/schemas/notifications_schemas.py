from marshmallow import Schema, fields

class NotificationSchema(Schema):

    notification_id = fields.UUID(dump_only=True)
    entity_id = fields.UUID()
    entity_type = fields.Str()
    message = fields.Str()
    payload = fields.Dict()
    recipient_user_id = fields.UUID()
    createdby = fields.Str()
    createdon = fields.DateTime()
    is_read = fields.Boolean()

notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)
