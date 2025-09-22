from flask import jsonify, request
from app import db
from app.models.work_order_model import WorkOrderView
from app.models.renault_arrival_form import ArrivalFormModel_RT
from app.models.manitou_arrival_form import ArrivalFormModel_MA
from app.models.sdlg_arrival_form import ArrivalFormModel_SDLG

def get_all_work_orders_data():

    try:
        brand_id = request.args.get('brand_id')
        group_id = request.args.get('group_id')

        # get allowed status
        allowed_statuses = ["CREATED", "IN PROCESS"]

        # subquery for fetch all WO data from each Table
        used_wo_subquery = db.session.query(ArrivalFormModel_MA.woNumber).union_all(
            db.session.query(ArrivalFormModel_RT.woNumber)
        ).union_all(
            db.session.query(ArrivalFormModel_SDLG.woNumber)
        ).subquery()

        query = db.session.query(WorkOrderView).filter(~WorkOrderView.CASEID.in_(used_wo_subquery))

        if group_id:
            query = query.filter(WorkOrderView.GROUPID == group_id)

        if brand_id:
            query = query.filter(WorkOrderView.DISPLAYVALUE == brand_id)

        query = query.filter(WorkOrderView.StatusWO.in_(allowed_statuses))

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