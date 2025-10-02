from marshmallow import Schema, fields, post_dump

class ArrivalChecklistItemSchema_MA(Schema):

    # for manitou
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Int()
    image_url = fields.Str()

class ArrivalChecklistItemSchema_RT(Schema):

    # for Renault
    section = fields.Str()
    itemName = fields.Str()
    status = fields.Bool()
    remarks = fields.Str()

class ArrivalChecklistItemSchema_SDLG(Schema):

    # for SDLG
    itemName = fields.Str(data_key='itemName')
    status = fields.Bool()
    remarks = fields.Str()

class ArrivalHeaderSchema(Schema):
    """Schema for summary table (list view)"""

    # header fields
    id = fields.UUID(attribute="arrivalID", dump_only=True)
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
    
arrival_list_schema = ArrivalHeaderSchema(many=True) 
    
class ArrivalDetailSchema_MA(Schema):

    id = fields.UUID(attribute="arrivalID", dump_only=True)
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
    checklist_items = fields.List(fields.Nested(ArrivalChecklistItemSchema_MA))

class ArrivalDetailSchema_RT(Schema):
    
    id = fields.UUID(attribute="arrivalID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    model = fields.Str()
    VIN = fields.Str()
    noChassis = fields.Str()
    noEngine = fields.Str()
    dateOfCheck = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    remarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist RT
    checklist_items = fields.List(fields.Nested(ArrivalChecklistItemSchema_RT))

class ArrivalDetailSchema_SDLG(Schema):
    
    id = fields.UUID(attribute="arrivalID", dump_only=True)
    brand = fields.Str()
    woNumber = fields.Str()
    distributionName = fields.Str()
    containerNo = fields.Str()
    leadSealingNo = fields.Str()
    model = fields.Str()
    VIN = fields.Str()
    dateOfCheck = fields.DateTime(format="iso")
    unitLanded = fields.DateTime(format="iso")
    clearanceCustom = fields.Str()
    unitStripping = fields.DateTime(format="iso")
    technician = fields.Str()
    approvalBy = fields.Str()
    remarks = fields.Str()
    createdBy = fields.Str()
    createdOn = fields.DateTime(format="iso")

    # Item Checklist SDLG
    checklist_items = fields.List(fields.Nested(ArrivalChecklistItemSchema_SDLG))

DETAIL_SCHEMA_MAP = {
    'manitou': ArrivalDetailSchema_MA(),
    'renault': ArrivalDetailSchema_RT(),
    'sdlg': ArrivalDetailSchema_SDLG(),
}