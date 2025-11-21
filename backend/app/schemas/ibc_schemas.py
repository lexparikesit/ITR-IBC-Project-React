from marshmallow import Schema, fields

class IBCAccessoriesSchema(Schema):

    # for IBC Accessories
    IBC_AccessoriesID = fields.UUID(dump_only=True)
    IBC_Accessories = fields.Str(required=True)
    Remarks = fields.Str(allow_none=True)
    qty_acc = fields.Int(required=True)

class IBCPackagesSchema(Schema):

    # for IBC Packages
    IBC_PackagesID = fields.UUID(dump_only=True)
    PackagesType = fields.Str(required=True)
    PackageDesc = fields.Str(required=True)

class IBCTransSchema(Schema):

    # for IBC Trans (unit information)
    IBC_TransID = fields.UUID(dump_only=True)
    VIN = fields.Str(required=True)
    AttachmentType = fields.Str(required=True)
    AttachmentSupplier = fields.Str(required=True)
    DeliveryAddress = fields.Str(required=True)
    DeliveryCustPIC = fields.Str(required=True)
    DeliveryPlan = fields.DateTime(required=True)
    Remarks = fields.Str(allow_none=True)

class IBCHeaderSchema(Schema):

    # for IBC Header Table
    IBC_ID = fields.UUID(dump_only=True)
    IBC_No = fields.Str()
    Requestor = fields.Str()
    IBC_date = fields.Str()
    PO_PJB = fields.Str()
    Cust_ID = fields.Str()
    Brand_ID = fields.Str()
    UnitType = fields.Str()
    QTY = fields.Int()
    SiteOperation = fields.Str()
    createdby = fields.Str()
    createdon = fields.DateTime()
    modifiedby = fields.Str()
    modifiedon = fields.DateTime()

class IBCDetailSchema(Schema):

    # for IBC Detail Schema
    IBC_ID = fields.UUID(dump_only=True)
    IBC_No = fields.Str()
    Requestor = fields.Str()
    IBC_date = fields.DateTime()
    PO_PJB = fields.Str()
    Cust_ID = fields.Str()
    Brand_ID = fields.Str()
    UnitType = fields.Str()
    QTY = fields.Int()
    SiteOperation = fields.Str()
    createdby = fields.Str()
    createdon = fields.DateTime()
    modifiedby = fields.Str()
    modifiedon = fields.DateTime()

    # Nested relationships
    ibc_trans = fields.List(fields.Nested(IBCTransSchema), dump_only=True)
    ibc_packages = fields.List(fields.Nested(IBCPackagesSchema), dump_only=True)
    ibc_accessories = fields.List(fields.Nested(IBCAccessoriesSchema), dump_only=True)
