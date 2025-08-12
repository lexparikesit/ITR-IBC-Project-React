from app import db
from app.models.package_model import MstPackages

def get_all_packages():
    """Retrieve all package data."""

    try:
        packages = MstPackages.query.all()
        return [package.to_dict() for package in packages], 200
    
    except Exception as e:
        return {'message': f'Error fetching packages: {str(e)}'}, 500

def create_package(data):
    """Create a new data package."""

    try:
        packages_type = data.get('PackagesType')

        if not packages_type:
            return {'message': 'PackagesType is required'}, 400

        new_package = MstPackages(
            PackagesType=packages_type
        )
        
        db.session.add(new_package)
        db.session.commit()
        
        return new_package.to_dict(), 201
    
    except Exception as e:
        db.session.rollback()
        return {'message': f'Error creating package: {str(e)}'}, 500