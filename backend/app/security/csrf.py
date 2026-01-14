import datetime
import secrets
import jwt

ALGORITHM = "HS256"

def generate_csrf_token(secret: str, ttl_minutes: int = 120) -> str:
    """Create a short-lived CSRF token."""
    now = datetime.datetime.utcnow()
    payload = {
        "jti": secrets.token_urlsafe(8),
        "iat": now,
        "exp": now + datetime.timedelta(minutes=ttl_minutes),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def verify_csrf_token(token: str, secret: str):
    """Verify CSRF token signature/expiry; raises jwt exceptions if invalid."""
    return jwt.decode(token, secret, algorithms=[ALGORITHM])
