from flask import jsonify, current_app
from app.controllers.auth_controller import jwt_required
from app.models.KHO_models import KHODocumentFormModel
from app.models.mst_unit_type_model import MstUnitType
from app.models.customer_model import get_customers
from sqlalchemy.engine.url import make_url

@jwt_required
def get_all_kho_logs():
    """Get all KHO documents for logging UI."""

    try:
        docs = KHODocumentFormModel.query.order_by(
            KHODocumentFormModel.createdOn.desc()
        ).all()

        # Build a map of TypeID (UUID string) -> Type label to translate type/model
        unit_types = MstUnitType.query.all()
        type_label_map = {str(ut.TypeID): ut.Type for ut in unit_types if getattr(ut, 'TypeID', None)}

        # Build a map of CustomerID -> CustomerName for translating customer IDs
        customer_label_map = {}
        try:
            sqlalchemy_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
            url = make_url(sqlalchemy_uri)
            connection_string = (
                f"DRIVER={url.query.get('driver')};"
                f"SERVER={url.host};"
                f"DATABASE={url.database};"
                f"UID={url.username};"
                f"PWD={url.password};"
            )
            customers = get_customers(connection_string) or []
            customer_label_map = {c.get('CustomerID'): c.get('CustomerName') for c in customers}
        except Exception:
            # Fallback to empty map if customers lookup fails; UI will show the stored value
            customer_label_map = {}

        result = []

        for doc in docs:
            # translate typeModel UUID to human-readable label when possible
            type_model_value = getattr(doc, 'typeModel', None)
            type_model_label = type_label_map.get(str(type_model_value), type_model_value)
            result.append({
                "khoID": str(doc.khoID),
                "dealerCode": doc.dealerCode,
                "customer": customer_label_map.get(doc.customer, doc.customer),
                "location": doc.location,
                "brand": doc.brand,
                "typeModel": type_model_label,
                "VIN": doc.VIN,
                "bastDate": doc.bastDate.strftime('%Y-%m-%d') if doc.bastDate else None,
                "createdBy": doc.createdBy,
                "createdOn": doc.createdOn.isoformat() if doc.createdOn else None,
            })
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"message": f"Error fetching logs: {str(e)}"}), 500
