from flask import Blueprint, Response, current_app, request
from urllib.parse import urlparse
from app.controllers.auth_controller import jwt_required
import os
import requests

media_bp = Blueprint("media", __name__, url_prefix="/api/media")

def _allowed_prefixes():
    """Returns a list of allowed URL prefixes for media proxying."""
    
    prefixes = []
    cdn_base = os.getenv("CDN_BASE_URL")
    if cdn_base:
        prefixes.append(cdn_base.rstrip("/"))

    bucket = os.getenv("GCS_BUCKET_NAME")
    if bucket:
        prefixes.append(f"https://storage.googleapis.com/{bucket}")

    # Fallback for known default bucket name
    prefixes.append("https://storage.googleapis.com/itr-ibc-bucket")
    return prefixes

def _is_allowed_url(url: str) -> bool:
    """
    Docstring for _is_allowed_url
    
    :param url: Description
    :type url: str
    :return: Description
    :rtype: bool
    """

    prefixes = _allowed_prefixes()
    return any(url.startswith(prefix) for prefix in prefixes)

@media_bp.route("/proxy", methods=["GET"])
@jwt_required
def proxy_media():
    """Docstring for proxy_media"""

    url = request.args.get("url")
    if not url:
        return {"message": "url is required"}, 400

    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return {"message": "invalid url scheme"}, 400

    if not _is_allowed_url(url):
        current_app.logger.warning("Blocked proxy attempt to %s", url)
        return {"message": "url not allowed"}, 403

    try:
        resp = requests.get(url, stream=True, timeout=15)
    
    except requests.RequestException as exc:
        current_app.logger.warning("Proxy fetch failed: %s", exc)
        return {"message": "failed to fetch media"}, 502

    if resp.status_code != 200:
        return {"message": "media fetch failed"}, resp.status_code

    content_type = resp.headers.get("Content-Type", "application/octet-stream")
    data = resp.content
    response = Response(data, mimetype=content_type)
    response.headers["Cache-Control"] = "private, max-age=300"
    
    return response
