from flask import Blueprint, request, jsonify, g
from app import db
from app.models.IBC_Table import IBC_Table
from app.models.IBC_Trans import IBC_Trans
from app.models.IBC_Accessories import IBC_Accessories
from app.models.IBC_Package import IBC_Packages
from app.controllers.auth_controller import jwt_required
from datetime import datetime
import uuid

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

    # get the last IBC number from DB
    last_ibc = IBC_Table.query.filter(
        IBC_Table.IBC_No.like(f"%/IBC/ITR/{current_month_roman}/{current_year}")
    ).order_by(
        IBC_Table.IBC_No.desc()
    ).first()

    if last_ibc:
        # if any, get last number before ('/') then adding +1
        last_number = int(last_ibc.IBC_No.split('/')[0])
        new_number = last_number + 1
    else:
        new_number = 1
    
    # Format the sequence number into 4 digits (e.g. 79 -> 0079)
    new_number_str = f'{new_number:04d}'

    # concatenate the number
    ibc_number = f'{new_number_str}/IBC/ITR/{current_month_roman}/{current_year}'

    return ibc_number

@jwt_required
def generate_ibc_number_and_save_header():

    try:
        data = request.json
        if not data:
            return jsonify({"error": "invalid JSON data"}), 400
        
        header_data = data.get('headerForm', {})

        if not header_data:
            return jsonify({"error": "Header data is required"}), 400

        ibc_number = generate_ibc_number()

        new_ibc_table = IBC_Table(
            IBC_ID = str(uuid.uuid4()),
            IBC_No = ibc_number,
            Requestor = header_data.get('Requestor'),
            IBC_date = datetime.strptime(header_data.get('IBC_date'), '%Y-%m-%d') if header_data.get('IBC_date') else datetime.now(),
            PO_PJB = header_data.get('PO_PJB'),
            Cust_ID = header_data.get('Cust_ID'),
            Brand_ID = header_data.get('Brand_ID'),
            UnitType = header_data.get('UnitType'),
            QTY = header_data.get('QTY'),
            SiteOperation = header_data.get('SiteOperation')
        )

        new_ibc_table.createdby = g.user_name
        new_ibc_table.createdon = datetime.utcnow()

        db.session.add(new_ibc_table)
        db.session.commit()

        return jsonify({
            'message': 'IBC number generated and header saved successfully',
            'ibc_number': ibc_number
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@jwt_required
def update_ibc_form():
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400

        ibc_number = data.get('IBC_No') 
        
        if not ibc_number:
            return jsonify({"error": "IBC Number is required for updating the form"}), 400

        ibc_table = IBC_Table.query.filter_by(IBC_No=ibc_number).first()
        
        if not ibc_table:
            return jsonify({"error": "IBC with the given number not found"}), 404
        
        detail_form_data = data.get('detailForm', {}) 
        vins_data = detail_form_data.get('vins', []) 

        IBC_Trans.query.filter_by(IBC_No=ibc_number).delete()
        
        wo_val = detail_form_data.get('WO')
        attachment_type_val = detail_form_data.get('AttachmentType')
        attachment_supplier_val = detail_form_data.get('AttachmentSupplier')
        delivery_address_val = detail_form_data.get('DeliveryAddress')
        delivery_cust_pic_val = detail_form_data.get('DeliveryCustPIC')
        
        delivery_plan_str = detail_form_data.get('DeliveryPlan')
        delivery_plan_val = None

        if delivery_plan_str:
            
            try:
                date_only_str = delivery_plan_str.split('T')[0]
                delivery_plan_val = datetime.strptime(date_only_str, '%Y-%m-%d')
            except Exception as e:
                print(f"Error converting DeliveryPlan date string: {e} for value: {delivery_plan_str}")
                return jsonify({'error': 'Invalid date format for Delivery Plan'}), 400

        remarks_val = detail_form_data.get('Remarks')

        for vin_entry in vins_data:
            if not vin_entry.get('VIN'):
                return jsonify({'error': 'VIN field is required in detail form'}), 400
            
            new_ibc_trans = IBC_Trans(
                IBC_TransID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                VIN = vin_entry.get('VIN'),
                WO = wo_val,
                AttachmentType = attachment_type_val,
                AttachmentSupplier = attachment_supplier_val,
                DeliveryAddress = delivery_address_val,
                DeliveryCustPIC = delivery_cust_pic_val,
                DeliveryPlan = delivery_plan_val,
                Remarks = remarks_val
            )
            db.session.add(new_ibc_trans)

        accessories_data = data.get('accessoriesForm', {}).get('accessories', [])
        
        IBC_Accessories.query.filter_by(IBC_No=ibc_number).delete()

        for acc_entry in accessories_data:
            if not acc_entry.get('AccessoriesName'):
                return jsonify({'error': 'Accessories name is required'}), 400

            new_ibc_acc = IBC_Accessories(
                IBC_AccessoriesID = str(uuid.uuid4()),
                IBC_No = ibc_number,
                IBC_Accessories = acc_entry.get('AccessoriesName'),
                Remarks = acc_entry.get('Remarks')
            )
            db.session.add(new_ibc_acc)
        
        packages_data = data.get('packagesForm', {}).get('packages', []) 
        
        IBC_Packages.query.filter_by(IBC_No=ibc_number).delete()

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
        
        db.session.commit()

        return jsonify({'message': 'Formulir IBC berhasil diperbarui.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500