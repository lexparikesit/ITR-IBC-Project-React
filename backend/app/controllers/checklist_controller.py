from flask import json, jsonify, request
from app import db
from app.models.renault_checklist_model import RenaultChecklistModel
from datetime import datetime

# mapping brand to model database
BRAND_MODELS = {
    'renault': RenaultChecklistModel,
    # manitou
    # sdlg
}

def submit_checklist():

    data = request.get_json()
    brand = data.get("brand")

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"error": "Invalid brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]

    new_checklist_entry = ModelClass()

    try:
        if brand.lower() == 'renault':

            # specific fields for Renault
            new_checklist_entry.UnitType = data.get("typeModel") # Frontend "Type Model" ke DB #mstType
            new_checklist_entry.VIN = data.get("vin")
            new_checklist_entry.EngineNo = data.get("noEngine")

            # mapping section Frontend to Prefix column in DB
            section_to_db_prefix = {
                "chassisAndCab": "Cab",
                "axleSpringTyre": "Axle",
                "battery": "Battery",
                "electrical": "Electrical",
                "additionalEquipment": "Equipment",
                "functionalCheck": "Functional",
            }

            for section_key_frontend, db_prefix in section_to_db_prefix.items():
                # loop through ID Items (1-8)
                items_ids = []

                if section_key_frontend == "chassisAndCab":
                    items_ids = range(1, 9)
                elif section_key_frontend == "axleSpringTyre":
                    items_ids = range(1, 5)
                elif section_key_frontend == "battery":
                    items_ids = range(1, 3)
                elif section_key_frontend == "electrical":
                    items_ids = range(1, 7)
                elif section_key_frontend == "additionalEquipment":
                    items_ids = range(1, 4)
                elif section_key_frontend == "functionalCheck":
                    items_ids = range(1, 5)
                
                for i in items_ids:
                    status_key_frontend = f"{section_key_frontend}_{i}_status"
                    remark_key_frontend = f"{section_key_frontend}Item_{i}_Remark"

                    db_status_column = f"{db_prefix}{i}"
                    db_remarks_column = f"{db_prefix}{i}Remark"

                    # convert status to boolean (bit)
                    status_value = None

                    if data.get(status_key_frontend) == "checked_without_remarks":
                        status_value = True #1
                    if data.get(status_key_frontend) == "checked_with_remarks":
                        status_value = False #0
                    
                    # set status
                    if hasattr(new_checklist_entry, db_status_column):
                        setattr(new_checklist_entry, db_status_column, status_value)
                    
                    # set remarks
                    if hasattr(new_checklist_entry, db_remarks_column):
                        setattr(new_checklist_entry, db_remarks_column, data.get(remark_key_frontend))

                    # later for manitou
                    # later for sdlg

            db.session.add(new_checklist_entry)
            db.session.commit()

            return jsonify({'message': f'{brand.capitalize()} Checklist submitted successfully!', 'AC_ID': str(new_checklist_entry.AC_ID)}), 201
                
    except Exception as e:
        db.session.rollback()
        
        if "Violation of UNIQUE KEY constraint" in str(e) or "duplicate key" in str(e).lower():
            return jsonify({'message': f'Duplicate VIN or Engine Number found for {brand.capitalize()}. Please check your input.'}), 409
        
        return jsonify({'message': f'Error submitting {brand.capitalize()} checklist: {str(e)}'}), 500

def get_all_checklists_by_brand(brand):

    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({"message": "Invalid or missing Brand"}), 400
    
    ModelClass = BRAND_MODELS[brand.lower()]
    checklists = ModelClass.query.all()

    return jsonify([checklist.to_dict() for checklist in checklists]), 200
    
def get_checklist_by_brand_and_id(brand, ac_id):
    
    if not brand or brand.lower() not in BRAND_MODELS:
        return jsonify({'message': 'Invalid or missing brand'}), 400

    ModelClass = BRAND_MODELS[brand.lower()]
    checklist = ModelClass.query.filter_by(AC_ID=ac_id).first() 
    
    if checklist:
        return jsonify(checklist.to_dict()), 200
    
    return jsonify({'message': 'Checklist not found for this brand and AC_ID'}), 404