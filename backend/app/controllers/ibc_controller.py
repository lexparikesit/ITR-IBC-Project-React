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

        # --- Processing of data IBC_Table (Header) ---
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
            createdon = datetime.utcnow()
        )
        db.session.add(new_ibc_table)

        # --- Processing of data IBC_Trans (Detail) ---
        wo_val = detail_form_data.get('WO')
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
                WO = wo_val,
                AttachmentType = attachment_type_val,
                AttachmentSupplier = attachment_supplier_val,
                DeliveryAddress = delivery_address_val,
                DeliveryCustPIC = delivery_cust_pic_val,
                DeliveryPlan = delivery_plan_val,
                Remarks = remarks_val
            )
            db.session.add(new_ibc_trans)

        # --- Processing of data IBC_Accessories ---
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
        
        # --- Processing of data IBC_Packages ---
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

        return jsonify({'message': 'Formulir IBC berhasil dibuat.', 'IBC_No': ibc_number}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating IBC form: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500