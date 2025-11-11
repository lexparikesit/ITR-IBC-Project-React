from marshmallow import Schema, fields, post_dump
from app.utils.gcs_utils import generate_signed_url

class CommissioningChecklistItemSchema_MA(Schema):

    # for section
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_blob_name = fields.Str()
    caption = fields.Str()
    image_url = fields.Method("get_signed_url", allow_none=True)

    def get_signed_url(self, obj):
        """Generate signed URL from image_blob_name"""
        
        if obj.image_blob_name:
            return generate_signed_url(obj.image_blob_name, expiration_hours=24)
        return None

class CommissioningChecklistItemSchema_RT(Schema):

    # for Renault
    section = fields.Str()
    itemName = fields.Str()
    checklist = fields.Bool(allow_none=True)
    notes = fields.Str(allow_none=True)

class CommissioningChecklistItemSchema_SDLG(Schema):

    # for SDLG
    itemName = fields.Str(data_key='itemName')
    status = fields.Bool()

class MajorComponentSchema_RT(Schema):

    # for Renault Major Component
    majorID = fields.UUID(dump_only=True)
    component = fields.Str()
    make = fields.Str()
    typeModel = fields.Str(attribute="type_model", allow_none=True)
    serialNumber = fields.Str(attribute="serial_number", allow_none=True)
    partNumber = fields.Str(attribute="part_number", allow_none=True)
    remarks = fields.Str(allow_none=True)

class CommissioningHeaderSchema(Schema):
    """Schema for summary table (list view). Uses MethodField to resolve N/A due to differing column names across models."""

    id = fields.UUID(attribute="commID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    model = fields.Method("get_model_field")
    VIN = fields.Str()
    dateOfCheck = fields.Method("get_date_of_check_field") 
    customer = fields.Str()
    technician = fields.Method("get_technician_field")
    approvalBy = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    def get_model_field(self, obj):
        """Get models name by brand"""
        
        if obj.brand == 'manitou':
            return getattr(obj, 'UnitType', None)
        else:
            return getattr(obj, 'typeModel', None)

    def get_date_of_check_field(self, obj):
        """Get the date of check data"""

        if obj.brand == 'manitou':
            return getattr(obj, 'commissioningDate', None)
        else:
            return getattr(obj, 'dateOfCheck', None)

    def get_technician_field(self, obj):
        """Get the technicians data"""
        
        if obj.brand == 'manitou':
            return getattr(obj, 'inspectorSignature', None)
        else:
            return getattr(obj, 'technician', None)

    @post_dump
    def include_full_details(self, data, **kwargs):
        """Add all data as the 'details' key for frontend compatibility. Display Row"""
        
        data['details'] = data.copy()
        data['details'].pop('id', None)
        return data

commissioning_list_schema = CommissioningHeaderSchema(many=True)

class CommissioningDetailSchema_MA(Schema):

    id = fields.UUID(attribute="commID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    customer = fields.Str()
    UnitType = fields.Str()
    VIN = fields.Str()
    hourMeter = fields.Float()
    deliveryDate = fields.DateTime(format="iso")
    commissioningDate = fields.DateTime(format="iso")
    inspectorSignature = fields.Str()
    approvalBy = fields.Str()
    remarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist Manitou
    checklist_items = fields.List(fields.Nested(CommissioningChecklistItemSchema_MA))

class CommissioningDetailSchema_RT(Schema):

    id = fields.UUID(attribute="commID", dump_only=True)
    jobCardNo = fields.Str()
    woNumber = fields.Str()
    dealerCode = fields.Str()
    dateOfCheck = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    brand = fields.Str()
    typeModel = fields.Str()
    VIN = fields.Str()
    CAM = fields.Str()
    FAB_no = fields.Str()
    deliveryDate = fields.DateTime(format="iso")
    customer = fields.Str()
    location = fields.Str()
    contactPerson = fields.Str()
    application = fields.Str()
    reg_fleet_no = fields.Str()
    inspectorSignature = fields.Str()
    inspectorSignatureDate = fields.DateTime(format="iso")
    supervisorSignature = fields.Str()
    supervisorSignatureDate = fields.DateTime(format="iso")
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist Renault
    checklist_items = fields.List(fields.Nested(CommissioningChecklistItemSchema_RT))

    # Major Components Renault
    major_components = fields.List(fields.Nested(MajorComponentSchema_RT))

class CommissioningDetailSchema_SDLG(Schema):

    id = fields.UUID(attribute="commID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    typeModel = fields.Str()
    VIN = fields.Str()
    dateOfCheck = fields.DateTime(format="iso")
    customer = fields.Str()
    technician = fields.Str()
    approvalBy = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")
    
    # Item Checklist SDLG
    checklist_items = fields.List(fields.Nested(CommissioningChecklistItemSchema_SDLG))

DETAIL_SCHEMA_MAP = {
    'manitou': CommissioningDetailSchema_MA(),
    'renault': CommissioningDetailSchema_RT(),
    'sdlg': CommissioningDetailSchema_SDLG(),
};