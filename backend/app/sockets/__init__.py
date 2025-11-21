from .notifications_socket import register_notifications_events

def register_socket_events(socketio):
    """Registers all socket event handlers."""
    
    register_notifications_events(socketio)
