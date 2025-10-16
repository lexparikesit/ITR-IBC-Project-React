from marshmallow import Schema, fields, post_dump

class StorageMaintenanceChecklistItemSchema_MA(Schema):

    # for manitou
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_url = fields.Str()

class StorageMaintenanceChecklistItemSchema_RT(Schema):

    # for Renault
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_url = fields.Str()
    value = fields.Str()
    code = fields.Str()
    caption = fields.Str()

class StorageMaintenanceChecklistItemSchema_SDLG(Schema):

    # for SDLG
    itemName = fields.Str(data_key='itemName')
    status = fields.Bool()

class MaintenanceDefectRemarksSchema_SDLG(Schema):

    # for SDLG description and remarks
    defectID = fields.UUID(dump_only=True)
    description = fields.Str()
    remarks = fields.Str(allow_none=True)

class StorageMaintenanceHeaderSchema(Schema):
    """Schema for summary table (list view)"""

    # header fields
    id = fields.UUID(attribute="smID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    VIN = fields.Str()
    model = fields.Str()
    technician = fields.Str()
    approvalBy = fields.Str()
    createdBy = fields.Str()

    # date of fields
    dateOfCheck = fields.DateTime(format="iso")
    createdOn = fields.DateTime(format="iso")

    @post_dump
    def include_full_details(self, data, **kwargs):
        """Add all data as the 'details' key for frontend compatibility. Display Row"""
        
        data['details'] = data.copy()
        data['details'].pop('id', None)
        return data
    
maintenance_list_schema = StorageMaintenanceHeaderSchema(many=True) 
    
class StorageMaintenanceDetailSchema_MA(Schema):

    id = fields.UUID(attribute="smID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    VIN = fields.Str()
    model = fields.Str()
    hourMeter = fields.Float()
    dateOfCheck = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    remarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist MA
    checklist_items = fields.List(fields.Nested(StorageMaintenanceChecklistItemSchema_MA))

class StorageMaintenanceDetailSchema_RT(Schema):
    
    id = fields.UUID(attribute="smID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    model = fields.Str()
    VIN = fields.Str()
    engineType = fields.Str()
    transmissionType = fields.Str()
    hourMeter = fields.Float()
    mileage = fields.Float()
    approvalBy = fields.Str()
    generalRemarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist RT
    checklist_items = fields.List(fields.Nested(StorageMaintenanceChecklistItemSchema_RT))

class StorageMaintenanceDetailSchema_SDLG(Schema):
    
    id = fields.UUID(attribute="smID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    model = fields.Str()
    VIN = fields.Str()
    hourMeter = fields.Float()
    vehicleArrivalDate = fields.DateTime(format="iso")
    dateOfCheck = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    signatureTechnician = fields.Str()
    signatureTechnicianDate = fields.DateTime(format="iso")
    signatureApprover = fields.Str()
    signatureApproverDate = fields.DateTime(format="iso")
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist SDLG
    checklist_items = fields.List(fields.Nested(StorageMaintenanceChecklistItemSchema_SDLG))

    # Defect and Remarks SDLG
    defect_remarks = fields.List(fields.Nested(MaintenanceDefectRemarksSchema_SDLG))

DETAIL_SCHEMA_MAP = {
    'manitou': StorageMaintenanceDetailSchema_MA(),
    'renault': StorageMaintenanceDetailSchema_RT(),
    'sdlg': StorageMaintenanceDetailSchema_SDLG(),
}