import os
import uuid
from datetime import datetime, date
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_maintenance_form import StorageMaintenanceFormModel_MA
from app.models.manitou_maintenance_items import StorageMaintenanceChecklistItemModel_MA
from app.models.renault_maintenance_form import StorageMaintenanceFormModel_RT
from app.models.renault_maintenance_items import StorageMaintenanceChecklistItemModel_RT
from app.models.sdlg_maintenance_form import StorageMaintenanceFormModel_SDLG
from app.models.sdlg_maintenance_items import StorageMaintenanceChecklistItemModel_SDLG
from app.models.sdlg_maintenance_form import Maintenance_sdlg_defect_remarks as StorageMaintenanceDefectRemarksModel_SDLG
from app.schemas.maintenance_schemas import (
    maintenance_list_schema,
    DETAIL_SCHEMA_MAP,
    StorageMaintenanceChecklistItemSchema_MA,
    StorageMaintenanceChecklistItemSchema_RT,
    StorageMaintenanceChecklistItemSchema_SDLG,
    MaintenanceDefectRemarksSchema_SDLG 
)

# Brand Models - Tuple: (HeaderModel, ItemModelSQLA, DefectModelSQLA, ItemSchemaMany, DefectSchemaMany)
BRAND_MODELS = {
    'manitou': (
        StorageMaintenanceFormModel_MA,
        StorageMaintenanceChecklistItemModel_MA, 
        None,
        StorageMaintenanceChecklistItemSchema_MA(many=True),
        None,
    ),
    'renault': (
        StorageMaintenanceFormModel_RT,
        StorageMaintenanceChecklistItemModel_RT, 
        None, 
        StorageMaintenanceChecklistItemSchema_RT(many=True),
        None,
    ),
    'sdlg': (
        StorageMaintenanceFormModel_SDLG,
        StorageMaintenanceChecklistItemModel_SDLG,
        StorageMaintenanceDefectRemarksModel_SDLG,
        StorageMaintenanceChecklistItemSchema_SDLG(many=True),
        MaintenanceDefectRemarksSchema_SDLG(many=True),
    )
}

def get_all_maintenance_checklists():
    """Retrieves all storage maintenance checklists from all brands."""

    all_logs = []

    try:
        for HeaderModel, *rest in BRAND_MODELS.values():
            logs = HeaderModel.query.all()
            all_logs.extend(logs)
        
        formatted_logs = maintenance_list_schema.dump(all_logs)

        return jsonify(formatted_logs), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching data: {str(e)}")
        db.session.rollback()
        
        return jsonify({'message': f'Error fetching log data: {str(e)}'}), 500
    
def get_storage_maintenance_details_by_id(sm_id_str):
    """Retrieves all Maintenance checklists item and defect remarks from all brands."""

    try:
        sm_id = uuid.UUID(sm_id_str)
    except:
        return jsonify({'message': 'Invalid UUID format.'}), 400
    
    header = None
    brand = None
    ItemSQLAlchemyModel = None
    DefectSQLAlchemyModel = None 
    DefectSchemaMany = None       
    
    for current_brand, (HeaderM, ItemModelSQLA, DefectModelSQLA, ItemSchemaMany, *DefectSchemaMany_tuple) in BRAND_MODELS.items():
        header = db.session.get(HeaderM, sm_id) 
        
        if header:
            brand = current_brand
            ItemSQLAlchemyModel = ItemModelSQLA 

            if DefectModelSQLA is not None:
                DefectSQLAlchemyModel = DefectModelSQLA
            
            if DefectSchemaMany_tuple:
                DefectSchemaMany = DefectSchemaMany_tuple[0]
                
            break

    if not header:
        return jsonify({'message': 'Storage Maintenance Log not found.'}), 404
    
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
            items_query = ItemSQLAlchemyModel.query.filter_by(smID=sm_id).all()
            items_data = ItemSchemaMany.dump(items_query)
            header_data['checklist_items'] = items_data

    is_defect_remarks_missing = 'defect_remarks' not in header_data or not header_data.get('defect_remarks')

    if is_defect_remarks_missing and brand_lower == 'sdlg' and DefectSQLAlchemyModel and DefectSchemaMany:
        defects_query = DefectSQLAlchemyModel.query.filter_by(smID=sm_id).all()
        defects_data = DefectSchemaMany.dump(defects_query)
        header_data['defect_remarks'] = defects_data
        
    return jsonify(header_data), 200
