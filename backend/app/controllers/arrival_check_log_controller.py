import os
import uuid
from datetime import datetime, date
from flask import json, jsonify, request, current_app, g
from app import db
from app.models.manitou_arrival_form import ArrivalFormModel_MA
from app.models.manitou_arrival_items import ArrivalChecklistItemModel_MA
from app.models.renault_arrival_form import ArrivalFormModel_RT
from app.models.renault_arrival_items import ArrivalChecklistItemModel_RT
from app.models.sdlg_arrival_form import ArrivalFormModel_SDLG
from app.models.sdlg_arrival_items import ArrivalChecklistItemModel_SDLG
from app.schemas.arrival_schemas import (
    arrival_list_schema, 
    DETAIL_SCHEMA_MAP,
    ArrivalChecklistItemSchema_MA, 
    ArrivalChecklistItemSchema_RT, 
    ArrivalChecklistItemSchema_SDLG
)

# Brand Models
BRAND_MODELS = {
    'manitou': (
        ArrivalFormModel_MA, 
        ArrivalChecklistItemModel_MA,
        None,
        ArrivalChecklistItemSchema_MA(many=True),
    ),
    'renault': (
        ArrivalFormModel_RT,
        ArrivalChecklistItemModel_RT, 
        None,
        ArrivalChecklistItemSchema_RT(many=True),
    ),
    'sdlg': (
        ArrivalFormModel_SDLG,
        ArrivalChecklistItemModel_SDLG,
        None,
        ArrivalChecklistItemSchema_SDLG(many=True),
    )
}

def get_all_arrival_checklists():
    """Retrieves all arrival checklists from all brands."""

    all_logs = []
    
    try:
        for HeaderModel, _, _, _ in BRAND_MODELS.values():
            logs = HeaderModel.query.all()
            all_logs.extend(logs)
        
        formatted_logs = arrival_list_schema.dump(all_logs)
        
        return jsonify(formatted_logs), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching data: {str(e)}")
        db.session.rollback()
        
        return jsonify({'message': f'Error fetching log data: {str(e)}'}), 500

def get_all_arrival_details_by_id(arrival_id_str):
    """Retrieves all arrival checklists item from all brands."""

    try:
        arrival_id = uuid.UUID(arrival_id_str)
    except:
        return jsonify({'message': 'Invalid UUID format.'}), 400
    
    header = None
    brand = None
    ItemSQLAlchemyModel = None

    for current_brand, (HeaderM, ItemModelSQLA, _, _) in BRAND_MODELS.items():
        header = db.session.get(HeaderM, arrival_id)

        if header:
            brand = current_brand
            ItemSQLAlchemyModel = ItemModelSQLA 
            break

    if not header:
        return jsonify({'message': 'Arrival Log not found.'}), 404

    brand_lower = brand.lower()
    detail_schema = DETAIL_SCHEMA_MAP.get(brand_lower) 

    if not detail_schema:
        return jsonify({'message': f'Schema not found for brand: {brand}'}), 500
    
    header_data = detail_schema.dump(header)

    if 'checklist_items' not in header_data:
        ItemSchemaMany = BRAND_MODELS[brand][3]
        
        if ItemSchemaMany:
            items_query = ItemSQLAlchemyModel.query.filter_by(arrivalID=arrival_id).all()
            items_data = ItemSchemaMany.dump(items_query)
            header_data['checklist_items'] = items_data

    return jsonify(header_data), 200