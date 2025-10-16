import requests
from flask import jsonify

def get_provinces():
    """Fetches province data from an external API, formats it, and returns it as a JSON response."""

    api_url = 'https://wilayah.id/api/provinces.json'
    province_map = {}
    
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        provinces_data = response.json()
        
        # Membuat kamus { "kode": "label" }
        province_map = {
            p.get("code"): p.get("name")
            for p in provinces_data.get("data", [])
        }
        return province_map
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching province data: {e}")
        return {}

PROVINCE_CACHE = get_provinces()

def get_province_name_by_code(code):
    """Fetches province API by code"""
    
    return PROVINCE_CACHE.get(code, code)