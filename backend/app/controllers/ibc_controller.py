from flask import Blueprint, request, jsonify, g
from app import db
from app.models.IBC_Table import IBC_Table
from app.models.IBC_Trans import IBC_Trans
from app.models.IBC_Accessories import IBC_Accessories
from app.models.IBC_Package import IBC_Packages
from app.controllers.auth_controller import jwt_required, require_permission
from app.service.notifications_utils import (
    build_payload,
    dispatch_notification,
    emit_notifications,
    resolve_user_display_name,
    normalize_recipient_ids,
    format_brand_label,
    resolve_model_label,
)
from app.service.notifications_service import create_notifications
from datetime import datetime
import uuid

IBC_SUBMISSION_ROLES = [
    "Salesman",
    "Product Head",
    "Technical Head",
    "General Manager - Chief Officer",
    "Super Admin",
]

IBC_UPDATE_ROLES = [
    "Salesman",
    "Product Head",
    "Technical Head",
    "General Manager - Chief Officer",
    "Super Admin",
]

def to_roman(number):
    """ Helper function for converting month numbers to Roman numerals. Description """
    
    roman_numerals = {
        1: "I",
        2: "II",
        3: "III",
        4: "IV",
        5: "V",
        6: "VI",
        7: "VII",
        8: "VIII",
        9: "IX",
        10: "X",
        11: "XI",
        12: "XII"
    }

    return roman_numerals.get(number, "")

def generate_ibc_number():
    """A function to automatically create an IBC number with the format: 000/IBC/ITR/XX/YYYY"""

    current_date = datetime.now()
    current_year = current_date.strftime('%Y')
    current_month_roman = to_roman(current_date.month)

    last_ibc = IBC_Table.query.filter(
        db.extract('year', IBC_Table.createdon) == current_date.year,
        db.extract('month', IBC_Table.createdon) == current_date.month
    ).order_by(db.desc(IBC_Table.IBC_No)).first()

    last_sequence_number = 0
    
    if last_ibc and last_ibc.IBC_No:
        try:
            last_number_str = last_ibc.IBC_No.split('/')[0]
            if last_number_str.isdigit():
                last_sequence_number = int(last_number_str)
        except (ValueError, IndexError):
            last_sequence_number = 0 
            print(f"Warning: Could not parse sequence number from IBC_No: {last_ibc.IBC_No}")

    new_sequence_number = last_sequence_number + 1
    new_sequence_str = f'{new_sequence_number:04d}'

    ibc_number = f'{new_sequence_str}/IBC/ITR/{current_month_roman}/{current_year}'
    return ibc_number

@jwt_required 
def create_ibc_form():
    """Controller function to handle the full IBC form submission."""
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        header_form_data = data.get('headerForm', {})
        detail_form_data = data.get('detailForm', {})
        accessories_data = data.get('accessoriesForm', {}).get('accessories', [])
        packages_data = data.get('packagesForm', {}).get('packages', [])

        if not header_form_data or not detail_form_data:
            return jsonify({"error": "Header and Detail form data are required"}), 400

        # processing of data IBC_Table (Header)
        ibc_number = generate_ibc_number()

        ibc_date_str = header_form_data.get('IBC_date')
        ibc_date_val = datetime.strptime(ibc_date_str, '%Y-%m-%d') if ibc_date_str else None

        new_ibc_table = IBC_Table(
            IBC_ID = str(uuid.uuid4()),
            IBC_No = ibc_number,
            Requestor = header_form_data.get('Requestor'),
            IBC_date = ibc_date_val,
            PO_PJB = header_form_data.get('PO_PJB'),
            Cust_ID = header_form_data.get('Cust_ID'),
            Brand_ID = header_form_data.get('Brand_ID'),
            UnitType = header_form_data.get('UnitType'),
            QTY = header_form_data.get('QTY'),
            SiteOperation = header_form_data.get('SiteOperation'),
            createdby = g.user_name,
            createdon = datetime.utcnow(),
            modifiedby = g.user_name,
            modifiedon = datetime.utcnow()
        )
        db.session.add(new_ibc_table)

        # processing of data IBC_Trans (Detail)
        attachment_type_val = detail_form_data.get('AttachmentType')
        attachment_supplier_val = detail_form_data.get('AttachmentSupplier')
        delivery_address_val = detail_form_data.get('DeliveryAddress')
        delivery_cust_pic_val = detail_form_data.get('DeliveryCustPIC')
        remarks_val = detail_form_data.get('Remarks')

        delivery_plan_str = detail_form_data.get('DeliveryPlan')
        delivery_plan_val = datetime.strptime(delivery_plan_str, '%Y-%m-%d') if delivery_plan_str else None
        
        vins_data = detail_form_data.get('vins', [])

        if not vins_data:
            return jsonify({'error': 'VIN data is required in detail form'}), 400

        for vin_entry in vins_data:
            if not vin_entry.get('VIN'):
                return jsonify({'error': 'VIN field is required in detail form'}), 400
            
            new_ibc_trans = IBC_Trans(
                IBC_TransID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                VIN = vin_entry.get('VIN'),
                AttachmentType = attachment_type_val,
                AttachmentSupplier = attachment_supplier_val,
                DeliveryAddress = delivery_address_val,
                DeliveryCustPIC = delivery_cust_pic_val,
                DeliveryPlan = delivery_plan_val,
                Remarks = remarks_val
            )
            db.session.add(new_ibc_trans)

        # processing of data IBC_Accessories
        for acc_entry in accessories_data:
            if not acc_entry.get('AccessoriesName'):
                return jsonify({'error': 'Accessories name is required'}), 400

            qty_value = acc_entry.get('qty_acc')
            
            try:
                qty_value = int(qty_value)
            except (TypeError, ValueError):
                return jsonify({'error': 'Accessory quantity must be a valid number'}), 400

            if qty_value <= 0:
                return jsonify({'error': 'Accessory quantity must be greater than zero'}), 400

            new_ibc_acc = IBC_Accessories(
                IBC_AccessoriesID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                IBC_Accessories = acc_entry.get('AccessoriesName'),
                Remarks = acc_entry.get('Remarks'),
                qty_acc = qty_value
            )
            db.session.add(new_ibc_acc)
        
        # processing of data IBC_Packages
        for pkg_entry in packages_data:
            if not pkg_entry.get('PackagesType'):
                return jsonify({'error': 'Package type is required'}), 400
            
            new_ibc_pkg = IBC_Packages(
                IBC_PackagesID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                PackagesType = pkg_entry.get('PackagesType'),
                PackageDesc = pkg_entry.get('PackageDesc')
            )

        db.session.add(new_ibc_pkg)
        db.session.flush()

        payload = build_payload(new_ibc_table, ["IBC_No", "Brand_ID", "UnitType", "QTY", "SiteOperation", "Requestor"])
        payload["brandLabel"] = format_brand_label(new_ibc_table.Brand_ID)
        payload["brand"] = payload["brandLabel"]
        payload["requestorName"] = resolve_user_display_name(new_ibc_table.Requestor)

        notifications_created = dispatch_notification(
            entity_type="ibc",
            entity_id=new_ibc_table.IBC_ID,
            approval_raw=[],
            technician=g.user_name,
            payload=payload,
            notify_roles=IBC_SUBMISSION_ROLES,
            technician_raw=None,
            exclude_submitter_roles=True,
        )

        requestor_notifications = []
        requestor_ids = normalize_recipient_ids(new_ibc_table.Requestor)
        submitter_uuid = None
        
        if getattr(g, "user_id", None):
            try:
                submitter_uuid = uuid.UUID(str(g.user_id))
            except (ValueError, TypeError):
                submitter_uuid = None
        
        if submitter_uuid:
            requestor_ids = [rid for rid in requestor_ids if rid != submitter_uuid]
        
        if requestor_ids:
            message = f"{g.user_name} listed you as Requestor of IBC No {ibc_number}"
            requestor_notifications = create_notifications(
                entity_type="ibc",
                entity_id=new_ibc_table.IBC_ID,
                message=message,
                recipients=requestor_ids,
                created_by=g.user_name,
                payload=payload,
            )
            notifications_created.extend(requestor_notifications or [])
        
        db.session.commit()
        emit_notifications(notifications_created)

        return jsonify({'message': 'Formulir IBC berhasil dibuat.', 'IBC_No': ibc_number}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating IBC form: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@jwt_required
@require_permission('edit_ibc')
def update_ibc_form(ibc_id):
    """Controller function to handle updates to an existing IBC form."""

    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        header_form_data = data.get('headerForm', {})
        detail_form_data = data.get('detailForm', {})
        accessories_data = data.get('accessoriesForm', {}).get('accessories', [])
        packages_data = data.get('packagesForm', {}).get('packages', [])

        if not header_form_data or not detail_form_data:
            return jsonify({"error": "Header and Detail form data are required"}), 400

        ibc_record = IBC_Table.query.filter_by(IBC_ID=ibc_id).first()
        
        if not ibc_record:
            return jsonify({"error": "IBC record not found"}), 404

        ibc_number = ibc_record.IBC_No
        ibc_date_str = header_form_data.get('IBC_date')
        
        if not ibc_date_str:
            return jsonify({"error": "IBC date is required"}), 400

        ibc_date_val = datetime.strptime(ibc_date_str, '%Y-%m-%d')

        ibc_record.Requestor = header_form_data.get('Requestor')
        ibc_record.IBC_date = ibc_date_val
        ibc_record.PO_PJB = header_form_data.get('PO_PJB')
        ibc_record.Cust_ID = header_form_data.get('Cust_ID')
        ibc_record.Brand_ID = header_form_data.get('Brand_ID')
        ibc_record.UnitType = header_form_data.get('UnitType')
        ibc_record.QTY = header_form_data.get('QTY')
        ibc_record.SiteOperation = header_form_data.get('SiteOperation')
        ibc_record.modifiedby = g.user_name
        ibc_record.modifiedon = datetime.utcnow()

        attachment_type_val = detail_form_data.get('AttachmentType')
        attachment_supplier_val = detail_form_data.get('AttachmentSupplier')
        delivery_address_val = detail_form_data.get('DeliveryAddress')
        delivery_cust_pic_val = detail_form_data.get('DeliveryCustPIC')
        remarks_val = detail_form_data.get('Remarks')

        delivery_plan_str = detail_form_data.get('DeliveryPlan')
        delivery_plan_val = datetime.strptime(delivery_plan_str, '%Y-%m-%d') if delivery_plan_str else None
        
        vins_data = detail_form_data.get('vins', [])

        if not vins_data:
            return jsonify({'error': 'VIN data is required in detail form'}), 400

        IBC_Trans.query.filter_by(IBC_No=ibc_number).delete(synchronize_session=False)

        for vin_entry in vins_data:
            if not vin_entry.get('VIN'):
                db.session.rollback()
                return jsonify({'error': 'VIN field is required in detail form'}), 400
            
            new_ibc_trans = IBC_Trans(
                IBC_TransID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                VIN = vin_entry.get('VIN'),
                AttachmentType = attachment_type_val,
                AttachmentSupplier = attachment_supplier_val,
                DeliveryAddress = delivery_address_val,
                DeliveryCustPIC = delivery_cust_pic_val,
                DeliveryPlan = delivery_plan_val,
                Remarks = remarks_val
            )
            db.session.add(new_ibc_trans)

        IBC_Accessories.query.filter_by(IBC_No=ibc_number).delete(synchronize_session=False)

        for acc_entry in accessories_data:
            if not acc_entry.get('AccessoriesName'):
                db.session.rollback()
                return jsonify({'error': 'Accessories name is required'}), 400

            qty_value = acc_entry.get('qty_acc')
            
            try:
                qty_value = int(qty_value)
            except (TypeError, ValueError):
                db.session.rollback()
                return jsonify({'error': 'Accessory quantity must be a valid number'}), 400

            if qty_value <= 0:
                db.session.rollback()
                return jsonify({'error': 'Accessory quantity must be greater than zero'}), 400

            new_ibc_acc = IBC_Accessories(
                IBC_AccessoriesID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                IBC_Accessories = acc_entry.get('AccessoriesName'),
                Remarks = acc_entry.get('Remarks'),
                qty_acc = qty_value
            )
            db.session.add(new_ibc_acc)
        
        IBC_Packages.query.filter_by(IBC_No=ibc_number).delete(synchronize_session=False)

        for pkg_entry in packages_data:
            if not pkg_entry.get('PackagesType'):
                db.session.rollback()
                return jsonify({'error': 'Package type is required'}), 400
            
            new_ibc_pkg = IBC_Packages(
                IBC_PackagesID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                PackagesType = pkg_entry.get('PackagesType'),
                PackageDesc = pkg_entry.get('PackageDesc')
            )
            db.session.add(new_ibc_pkg)
        
        payload = build_payload(ibc_record, ["IBC_No", "Brand_ID", "UnitType", "QTY", "SiteOperation", "Requestor"])
        payload["brandLabel"] = format_brand_label(ibc_record.Brand_ID)
        payload["brand"] = payload["brandLabel"]
        payload["requestorName"] = resolve_user_display_name(ibc_record.Requestor)
        payload["updatedBy"] = g.user_name
        payload["updatedOn"] = datetime.utcnow().isoformat()

        notifications_created = dispatch_notification(
            entity_type="ibc_update",
            entity_id=ibc_record.IBC_ID,
            approval_raw=[],
            technician=g.user_name,
            payload=payload,
            notify_roles=IBC_UPDATE_ROLES,
            technician_raw=None,
            exclude_submitter_roles=True,
        )

        db.session.commit()
        emit_notifications(notifications_created)

        return jsonify({'message': 'IBC form updated successfully.', 'IBC_No': ibc_number}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating IBC form: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
