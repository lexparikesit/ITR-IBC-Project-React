from flask import jsonify, request
from app import db
from app.models.work_order_model import WorkOrderView
from app.models.IBC_Trans import IBC_Trans

def get_all_work_orders_data():

    try:
        brand_id = request.args.get('brand_id')
        query = db.session.query(WorkOrderView)

        used_wo_subquery = db.session.query(IBC_Trans.WO).subquery()
        query = query.filter(~WorkOrderView.CASEID.in_(used_wo_subquery))

        if brand_id:
            query = query.filter(WorkOrderView.DISPLAYVALUE == brand_id)

        work_orders = query.all()

        formatted_wo = [
            {
                'WONumber': wo.CASEID,
                'Brand': wo.DISPLAYVALUE
            } for wo in work_orders
        ]

        return formatted_wo, 200

    except Exception as e:
        return {'error': str(e)}, 500