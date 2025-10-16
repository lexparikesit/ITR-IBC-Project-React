import os
import uuid
from datetime import datetime, date
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_pdi_form import PDIFormModel_MA
from app.models.manitou_pdi_items import PDIChecklistItemModel_MA
from app.models.renault_pdi_form import PDIFormModel_RT
from app.models.renault_pdi_items import PDIChecklistItemModel_RT
from app.models.sdlg_pdi_form import PDIFormModel_Sdlg
from app.models.sdlg_pdi_items import PDIChecklistItemModel_SDLG
from app.models.sdlg_pdi_form import PDI_sdlg_defect_remarks as PDIDefectRemarksModel_SDLG
from app.schemas.pdi_schemas import (
    preDelivery_list_schema,
    DETAIL_SCHEMA_MAP,
    PreDeliveryChecklistItemSchema_MA,
    PreDeliveryChecklistItemSchema_RT,
    PreDeliveryChecklistItemSchema_SDLG,
    PreDeliveryDefectRemarksSchema_SDLG,
)

# Brand Models
BRAND_MODELS = {
    'manitou': (
        PDIFormModel_MA,
        PDIChecklistItemModel_MA, 
        None,
        PreDeliveryChecklistItemSchema_MA(many=True),
    ),
    'renault': (
        PDIFormModel_RT,
        PDIChecklistItemModel_RT, 
        None,
        PreDeliveryChecklistItemSchema_RT(many=True),
    ),
    'sdlg': (
        PDIFormModel_Sdlg,
        PDIChecklistItemModel_SDLG,
        PDIDefectRemarksModel_SDLG,
        PreDeliveryChecklistItemSchema_SDLG(many=True),
        PreDeliveryDefectRemarksSchema_SDLG(many=True),
    )
}

def get_all_pdi_checklists():
    """Retrieves all storage maintenance checklists from all brands."""

    all_logs = []

    try:
        for HeaderModel, *rest in BRAND_MODELS.values():
            logs = HeaderModel.query.all()
            all_logs.extend(logs)
        
        formatted_logs = preDelivery_list_schema.dump(all_logs)

        return jsonify(formatted_logs), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching data: {str(e)}")
        db.session.rollback()
        
        return jsonify({'message': f'Error fetching log data: {str(e)}'}), 500
    
def get_preDelivery_details_by_id(pdi_id_str):
    """Retrieves all Maintenance checklists item from all brands."""

    try:
        pdi_id = uuid.UUID(pdi_id_str)
    except:
        return jsonify({'message': 'Invalid UUID format.'}), 400
    
    header = None
    brand = None
    ItemSQLAlchemyModel = None
    DefectSQLAlchemyModel = None
    DefectSchemaMany = None
    
    for current_brand, (HeaderM, ItemModelSQLA, DefectModelSQLA, ItemSchemaMany, *DefectSchemaMany_tuple) in BRAND_MODELS.items():
        header = db.session.get(HeaderM, pdi_id) 
        
        if header:
            brand = current_brand
            ItemSQLAlchemyModel = ItemModelSQLA 
            
            if DefectModelSQLA is not None:
                DefectSQLAlchemyModel = DefectModelSQLA

            if DefectSchemaMany_tuple:
                DefectSchemaMany = DefectSchemaMany_tuple[0]
            
            break

    if not header:
        return jsonify({'message': 'Pre Delivery Inspection Log not found.'}), 404
    
    brand_lower = brand.lower()
    detail_schema = DETAIL_SCHEMA_MAP.get(brand_lower) 

    if not detail_schema:
        return jsonify({'message': f'Schema not found for brand: {brand}'}), 500
    
    header_data = detail_schema.dump(header)

    is_checklist_missing_or_renault = (
        'checklist_items' not in header_data or
        brand_lower == 'renault'
    )

    if is_checklist_missing_or_renault:
        ItemSchemaMany = BRAND_MODELS[brand][3]

        if ItemSchemaMany and ItemSQLAlchemyModel:
            item_squery = ItemSQLAlchemyModel.query.filter_by(pdiID=pdi_id).all()
            items_data = ItemSchemaMany.dump(item_squery)
            header_data['checklist_items'] = items_data

    is_defect_remarks_missing = 'defect_remarks' not in header_data or not header_data.get('defect_remarks')

    if is_defect_remarks_missing and brand_lower == 'sdlg' and DefectSQLAlchemyModel and DefectSchemaMany:
        defects_query = DefectSQLAlchemyModel.query.filter_by(pdiID=pdi_id).all()
        defects_data = DefectSchemaMany.dump(defects_query)
        header_data['defect_remarks'] = defects_data

    return jsonify(header_data), 200

