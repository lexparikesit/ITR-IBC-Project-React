# app/controllers/unit_type_controller.py
from flask import jsonify
from app.models.mst_unit_type_model import MstUnitType # Pastikan ini diimpor dengan benar

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
            # Pastikan kolom TypeID dan Type ada di model MstUnitType Anda
            if hasattr(unit_type, 'TypeID') and hasattr(unit_type, 'Type'):
                formatted_unit_types.append({
                    'value': str(unit_type.TypeID),  # Convert UUID to string if TypeID is UUID
                    'label': unit_type.Type,
                })
            else:
                # Opsional: Log warning jika kolom tidak ditemukan, atau gunakan fallback
                print(f"Warning: MstUnitType instance missing 'TypeID' or 'Type' attribute: {unit_type}")
        
        return jsonify(formatted_unit_types), 200
    except Exception as e:
        # Logging error untuk debugging
        print(f"Error fetching unit types for brand {brand_id}: {str(e)}")
        return jsonify({'message': f'Error fetching unit types: {str(e)}'}), 500

