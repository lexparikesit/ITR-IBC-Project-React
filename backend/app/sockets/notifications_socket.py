from collections import defaultdict
from flask import request
from flask_socketio import join_room
from app.controllers.auth_controller import verify_jwt_token

connected_clients = defaultdict(set)

def _extract_token():
    """Extracts JWT token from query parameters or Authorization header."""

    token = request.args.get("token")
    
    if token:
        return token

    auth_header = request.headers.get("Authorization")
    
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1]

    cookie_token = request.cookies.get("auth_token") or request.cookies.get("session_token")
    return cookie_token


def register_notifications_events(socketio):
    """Registers notification-related socket events."""

    @socketio.on("connect")
    def handle_connect():
        """Handles new client connections."""

        token = _extract_token()
        payload = verify_jwt_token(token) if token else None

        if not payload or not payload.get("user_id"):
            raise ConnectionRefusedError("unauthorized")

        user_id = payload["user_id"]
        room = str(user_id)
        join_room(room)
        connected_clients[user_id].add(request.sid)

    @socketio.on("disconnect")
    def handle_disconnect():
        """Handles client disconnections."""

        sid = request.sid
        
        for user_id, sids in list(connected_clients.items()):
            if sid in sids:
                sids.remove(sid)
                if not sids:
                    connected_clients.pop(user_id, None)
                break
