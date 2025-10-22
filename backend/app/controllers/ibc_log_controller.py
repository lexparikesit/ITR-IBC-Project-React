from flask import jsonify
from marshmallow import ValidationError
from app import db
from app.models.IBC_Table import IBC_Table
from app.models.IBC_Trans import IBC_Trans
from app.models.IBC_Package import IBC_Packages
from app.models.IBC_Accessories import IBC_Accessories
from app.schemas.ibc_schemas import IBCDetailSchema, IBCHeaderSchema

ibc_detail_schema = IBCDetailSchema()
ibc_list_schema = IBCHeaderSchema(many=True)

def get_all_ibc():
    """retrieve all ibc header data"""

    try:
        ibcs = IBC_Table.query.all()
        return jsonify(ibc_list_schema.dump(ibcs)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def get_ibc_by_id(ibc_id):
    """retrieve all ibc detail by ibc number"""

    try:
        ibc = IBC_Table.query.filter_by(IBC_ID=ibc_id).first_or_404()
        return jsonify(ibc_detail_schema.dump(ibc)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

