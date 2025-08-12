# app/controllers/unit_type_controller.py
from flask import jsonify
from app import db
from app.models.mst_unit_type_model import MstUnitType

def get_unit_types_by_brand(brand_id):
    """Retrieve all unit types for a specific brand."""
    
    try:
        if not brand_id:
            return jsonify({"error": "Brand ID is required"}), 400
        
        # Query the database for unit types by brand ID
        # Brand ID RT will send to Frontend
        unit_types = MstUnitType.query.filter_by(BrandID=brand_id.upper()).all()

        # Data format for Mantine Select component
        formatted_unit_types = []

        for unit_type in unit_types:
            if hasattr(unit_type, 'TypeID') and hasattr(unit_type, 'Type'):
                formatted_unit_types.append({
                    'value': str(unit_type.TypeID),  # Convert UUID to string if TypeID is UUID
                    'label': unit_type.Type,
                })
            else:
                # for debugging purposes, log the unit_type object
                print(f"Warning: MstUnitType instance missing 'TypeID' or 'Type' attribute: {unit_type}")
        
        return jsonify(formatted_unit_types), 200
    except Exception as e:
        # for debugging purposes, log the error
        print(f"Error fetching unit types for brand {brand_id}: {str(e)}")
        return jsonify({'message': f'Error fetching unit types: {str(e)}'}), 500

def get_all_brands():
    """Retrieve all unique BrandIDs from the mstTypeUnit table."""
    
    try:
        # Retrieve all unique BrandIDs from the BrandID column
        unique_brands = db.session.query(MstUnitType.BrandID).distinct().all()
        
        # Converting query results into the format that the frontend needs
        # [{ 'value': 'BrandID', 'label': 'BrandID' }]
        brands_data = [{'value': brand[0], 'label': brand[0]} for brand in unique_brands]

        return jsonify(brands_data), 200
    
    except Exception as e:
        print(f"Error fetching all brands: {str(e)}")
        return jsonify({"message": f"Error fetching all brands: {str(e)}"}), 500

