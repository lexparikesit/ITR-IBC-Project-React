from flask import jsonify
from app import db
from app.models.accessories_model import MstAccesories

def get_all_accesories():
    """Retrieve all accessory data."""
    
    try:
        accesories = MstAccesories.query.all()
        return [accessory.to_dict() for accessory in accesories], 200
    
    except Exception as e:
        return {'message': f'Error fetching accessories: {str(e)}'}, 500

def create_accesory(data):
    """Create new accessories data."""
    
    try:
        accesories_name = data.get('AccesoriesName')
        
        if not accesories_name:
            return {'message': 'AccesoriesName is required'}, 400

        new_accesory = MstAccesories(
            AccesoriesName=accesories_name
        )

        db.session.add(new_accesory)
        db.session.commit()
        
        return new_accesory.to_dict(), 201
    
    except Exception as e:
        db.session.rollback()
        return {'message': f'Error creating accessory: {str(e)}'}, 500