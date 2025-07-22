from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_session import Session
from dotenv import load_dotenv
import os

db = SQLAlchemy()
mail = Mail()
session = Session()

def create_app():
    
    app = Flask(__name__)
    load_dotenv() # Load environment variables from .env file

    # config dari environment variables
    app.secret_key = os.getenv("SECRET_KEY", "super-secret-key")
    
    # app session config
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    
    session.init_app(app)

    # DB connfig
    DB_SERVER = os.getenv('DB_SERVER', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'mydatabase')
    DB_USER = os.getenv('DB_USER', 'myuser')
    DB_PASS = os.getenv('DB_PASS', 'mypassword')
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')

    # app.config["SQLALCHEMY_DATABASE_URI"] = (
    #     f"mssql+pyodbc://{DB_USER}:{DB_PASS}@{DB_SERVER}/{DB_NAME}"
    # )

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mssql+pyodbc://{DB_USER}:{DB_PASS}@{DB_SERVER}/{DB_NAME}?driver={DB_DRIVER.replace(' ', '+')}"
    )

    # Email config
    app.config['MAIL_SERVER'] = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('SMTP_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
    app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASS')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('EMAIL_USER')

    # Cors  for ReactJS/ NextJS frontend
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

    # init extensions
    db.init_app(app)
    mail.init_app(app)

    from app.models.renault_checklist_model import RenaultChecklistModel 
    from app.models.manitou_checklist_model import ManitouChecklistModel
    from app.models.mst_unit_type_model import MstUnitType

    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    from app.routes.arrival_check_routes import arrival_check_bp 
    app.register_blueprint(arrival_check_bp, url_prefix='/api/arrival-check') 
    
    from app.routes.unit_type_routes import unit_type_bp
    app.register_blueprint(unit_type_bp, url_prefix='/api/unit-types')
    
    return app
