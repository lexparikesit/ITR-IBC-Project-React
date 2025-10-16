import os
import uuid
from datetime import datetime, date
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_commissioning_form import CommissioningFormModel_MA
from app.models.manitou_commissioning_items import CommissioningChecklistItemModel_MA
from app.models.renault_commissioning_form import CommissioningFormModel_RT
from app.models.renault_commissioning_items import CommissioningChecklistItemModel_RT
from app.models.renault_commissioning_form import MajorComponent_RT as CommissioningComponentModel_RT
from app.models.sdlg_commissioning_form import CommissioningFormModel_SDLG
from app.models.sdlg_commissioning_items import CommissioningChecklistItemModel_SDLG
from app.schemas.commissioning_schemas import (
    commissioning_list_schema,
    DETAIL_SCHEMA_MAP,
    CommissioningChecklistItemSchema_MA,
    CommissioningChecklistItemSchema_RT,
    MajorComponentSchema_RT,
    CommissioningChecklistItemSchema_SDLG,
)

# Brand Models - Tuple: (HeaderModel, ItemModelSQLA, DefectModelSQLA, ItemSchemaMany, DefectSchemaMany)
BRAND_MODELS = {
    'manitou': (
        CommissioningFormModel_MA,
        CommissioningChecklistItemModel_MA, 
        None,
        CommissioningChecklistItemSchema_MA(many=True),
        None,
    ),
    'renault': (
        CommissioningFormModel_RT,
        CommissioningChecklistItemModel_RT, 
        CommissioningComponentModel_RT,
        CommissioningChecklistItemSchema_RT(many=True),
        MajorComponentSchema_RT(many=True),
    ),
    'sdlg': (
        CommissioningFormModel_SDLG,
        CommissioningChecklistItemModel_SDLG,
        None,
        CommissioningChecklistItemSchema_SDLG(many=True),
        None,
    )
}

def get_all_commissioning_logs():
    """Retrieves all commissioning logs from all brands."""

    all_logs = []

    try:
        for HeaderModel, *rest in BRAND_MODELS.values():
            logs = HeaderModel.query.all()
            all_logs.extend(logs)
        
        formatted_logs = commissioning_list_schema.dump(all_logs)

        return jsonify(formatted_logs), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching data: {str(e)}")
        db.session.rollback()

        return jsonify({'message': f'Error fetching log data: {str(e)}'}), 500
    
def get_commissioning_details_by_id(comm_id_str):
    """Retrieves all Maintenance checklists item and defect remarks from all brands."""

    try:
        comm_id = uuid.UUID(comm_id_str)
    except:
        return jsonify({'message': 'Invalid UUID format.'}), 400
    
    header = None
    brand = None
    ItemSQLAlchemyModel = None
    MajorComponentSQLAlchemyModel = None
    MajorComponentSchemaMany = None

    for current_brand, (HeaderM, ItemModelSQLA, MajorCompModelSQLA, ItemSchemaMany, *MajorCompSchema_tuple) in BRAND_MODELS.items():
        header = db.session.get(HeaderM, comm_id)
        
        if header:
            brand = current_brand
            ItemSQLAlchemyModel = ItemModelSQLA
            
            if MajorCompModelSQLA is not None:
                MajorComponentSQLAlchemyModel = MajorCompModelSQLA

            if MajorCompSchema_tuple:
                MajorComponentSchemaMany = MajorCompSchema_tuple[0]\
            
            break

    if not header:
        return jsonify({'message': 'Commissioning log not found.'}), 404
    
    brand_lower = brand.lower()
    detail_schema = DETAIL_SCHEMA_MAP.get(brand_lower)

    if not detail_schema:
        return jsonify({'message': f'Schema not found for brand: {brand}'}), 500
    
    header_data = detail_schema.dump(header)

    is_checklist_missing_or_renault = (
        'checklist_items' not in header_data or 
        brand_lower == 'renault'
    )

    if is_checklist_missing_or_renault and ItemSQLAlchemyModel:
        ItemSchemaMany = BRAND_MODELS[brand][3]
        items_query = ItemSQLAlchemyModel.query.filter_by(commID=comm_id).all()
        items_data = ItemSchemaMany.dump(items_query)
        header_data['checklist_items'] = items_data

    if brand_lower == 'renault' and MajorComponentSQLAlchemyModel and MajorComponentSchemaMany:
        major_components_query = MajorComponentSQLAlchemyModel.query.filter_by(commID=comm_id).all()
        major_components_data = MajorComponentSchemaMany.dump(major_components_query)
        header_data['major_components'] = major_components_data

    return jsonify(header_data), 200
