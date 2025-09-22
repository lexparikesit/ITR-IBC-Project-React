import requests
from flask import jsonify

def get_provinces():
    """Fetches province data from an external API, formats it, and returns it as a JSON response."""

    api_url = 'https://wilayah.id/api/provinces.json'

    try:
        response = requests.get(api_url)
        response.raise_for_status()

        provinces_data = response.json()

        formatted_data = [
            {"value": p.get("code"), "label": p.get("name")}
            for p in provinces_data.get("data", [])
        ]

        return jsonify(formatted_data)
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Failed to fetch data from external API."}), 500
    
    except Exception as e:
        return jsonify({"error": "An internal server error occurred."}), 500