from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_session import Session
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

db = SQLAlchemy()
mail = Mail()
session = Session()


def create_app():

    app = Flask(__name__)
    load_dotenv()  # Load environment variables from .env file

    # config dari environment variables
    app.secret_key = os.getenv("SECRET_KEY", "super-secret-key")

    # app session config
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

    session.init_app(app)

    # DB connfig
    DB_SERVER = os.getenv("DB_SERVER", "localhost")
    DB_NAME = os.getenv("DB_NAME", "mydatabase")
    DB_USER = os.getenv("DB_USER", "myuser")
    DB_PASS = os.getenv("DB_PASS", "mypassword")
    DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

    # app.config["SQLALCHEMY_DATABASE_URI"] = (
    #     f"mssql+pyodbc://{DB_USER}:{DB_PASS}@{DB_SERVER}/{DB_NAME}"
    # )

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mssql+pyodbc://{DB_USER}:{DB_PASS}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER.replace(' ', '+')}"
    )

    # Email config
    app.config["MAIL_SERVER"] = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"] = int(os.getenv("SMTP_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    app.config["MAIL_USERNAME"] = os.getenv("EMAIL_USER")
    app.config["MAIL_PASSWORD"] = os.getenv("EMAIL_PASS")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("EMAIL_USER")

    # Initialize JWT config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "itribc")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
    app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production with HTTPS
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # Disable CSRF for development
    jwt = JWTManager(app)

    # JWT Error Handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {"msg": "The token has expired", "error": "token_expired"}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {"msg": "Invalid token", "error": "invalid_token"}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {
            "msg": "Authorization token is required",
            "error": "authorization_required",
        }, 401
        
    from app.models.user_model import User
    
    @jwt.user_lookup_loader
    def user_lookup_callback(jwt_header, jwt_payload):
        user_id = jwt_payload["sub"]
        return User.query.get(user_id)  # Assuming User is your user model

    # Cors  for ReactJS/ NextJS frontend
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    # init extensions
    db.init_app(app)
    mail.init_app(app)

    from app.models.renault_checklist_model import RenaultChecklistModel
    from app.models.manitou_checklist_model import ManitouChecklistModel
    from app.models.mst_unit_type_model import MstUnitType

    from app.routes.auth_routes import auth_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from app.routes.arrival_check_routes import arrival_check_bp

    app.register_blueprint(arrival_check_bp, url_prefix="/api/arrival-check")

    from app.routes.unit_type_routes import unit_type_bp

    app.register_blueprint(unit_type_bp, url_prefix="/api/unit-types")

    return app
