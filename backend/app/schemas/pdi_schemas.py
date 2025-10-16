from marshmallow import Schema, fields, post_dump

class PreDeliveryChecklistItemSchema_MA(Schema):
    
    # for manitou
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_url = fields.Str()

class PreDeliveryChecklistItemSchema_RT(Schema):
    
    # for Renault
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_url = fields.Str()
    value = fields.Str()
    code = fields.Str()
    caption = fields.Str()

class PreDeliveryChecklistItemSchema_SDLG(Schema):
    
    # for SDLG
    itemName = fields.Str(data_key='itemName')
    status = fields.Bool()

class PreDeliveryDefectRemarksSchema_SDLG(Schema):

    # for SDLG description and remarks
    defectID = fields.UUID(dump_only=True)
    description = fields.Str()
    remarks = fields.Str(allow_none=True)

class PreDeliveryHeaderSchema(Schema):
    """Schema for summary table (list view). Uses MethodField to resolve N/A due to differing column names across models."""

    id = fields.UUID(attribute="pdiID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    VIN = fields.Str()
    model = fields.Method("get_model_name")
    dateOfCheck = fields.Method("get_date_of_check")
    technician = fields.Method("get_technician_name")
    approvalBy = fields.Method("get_approval_by_name")
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")
    
    def get_model_name(self, obj):
        
        brand = obj.brand.lower()
        
        if brand == 'manitou':
            return getattr(obj, 'machineType', None)
        if brand == 'sdlg':
            return getattr(obj, 'machineModel', None)
        return getattr(obj, 'model', None)

    def get_date_of_check(self, obj):
        
        brand = obj.brand.lower()
        date_field = None
        
        if brand == 'manitou':
            date_field = getattr(obj, 'checkingDate', None)
        elif brand == 'renault':
            date_field = getattr(obj, 'Date', None)
        else:
            date_field = getattr(obj, 'dateOfCheck', None)

        if date_field:
            return date_field.isoformat() 
        return None

    def get_technician_name(self, obj):
        
        brand = obj.brand.lower()
        
        if brand == 'manitou':
            return getattr(obj, 'inspectorSignature', None)
        return getattr(obj, 'technician', None)

    def get_approval_by_name(self, obj):
        
        brand = obj.brand.lower()
        
        if brand == 'manitou':
            return getattr(obj, 'approver', None)
        return getattr(obj, 'approvalBy', None)

    @post_dump
    def include_full_details(self, data, **kwargs):
        data['details'] = data.copy()
        data['details'].pop('id', None)
        return data
    
preDelivery_list_schema = PreDeliveryHeaderSchema(many=True)

class PreDeliveryDetailSchema_MA(Schema):

    id = fields.UUID(attribute="pdiID", dump_only=True)
    brand = fields.Str()
    dealerCode = fields.Str()
    woNumber = fields.Str()
    model = fields.Str(data_key='model', attribute='machineType') 
    VIN = fields.Str()
    dateOfCheck = fields.DateTime(data_key='dateOfCheck', attribute='checkingDate', format="iso")
    hourMeter = fields.Float(data_key="hourMeter", attribute="HourMeter")
    customer = fields.Str()
    approvalBy = fields.Str(data_key='approvalBy', attribute='approver')
    technician = fields.Str(data_key='technician', attribute='inspectorSignature')
    remarksTransport = fields.Str()
    generalRemarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")
    checklist_items = fields.List(fields.Nested(PreDeliveryChecklistItemSchema_MA))

class PreDeliveryDetailSchema_RT(Schema):
    
    id = fields.UUID(attribute="pdiID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    VIN = fields.Str()
    dateOfCheck = fields.DateTime(data_key='dateOfCheck', attribute='Date', format="iso")
    customer = fields.Str()
    mileage = fields.Float()
    chassisID = fields.Str()
    registrationNo = fields.Str()
    province = fields.Str()
    model = fields.Str()
    engine = fields.Str()
    technician = fields.Str()
    approvalBy = fields.Str()
    vehicle_inspection = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")
    checklist_items = fields.List(fields.Nested(PreDeliveryChecklistItemSchema_RT))

class PreDeliveryDetailSchema_SDLG(Schema):
    
    id = fields.UUID(attribute="pdiID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    model = fields.Str(data_key='model', attribute='machineModel')
    VIN = fields.Str()
    dateOfCheck = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    technicianSignature = fields.Str()
    technicianSignatureDate = fields.Str()
    approverSignature = fields.Str()
    approverSignatureDate = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")
    
    # Item Checklist SDLG
    checklist_items = fields.List(fields.Nested(PreDeliveryChecklistItemSchema_SDLG))

    # Defect and Remarks SDLG
    defect_remarks = fields.List(fields.Nested(PreDeliveryDefectRemarksSchema_SDLG))

DETAIL_SCHEMA_MAP = {
    'manitou': PreDeliveryDetailSchema_MA(),
    'renault': PreDeliveryDetailSchema_RT(),
    'sdlg': PreDeliveryDetailSchema_SDLG(),
}