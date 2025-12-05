from flask import Flask, app
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

db = SQLAlchemy()
mail = Mail()
socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    
    app = Flask(__name__)
    # Load environment variables from backend/.env regardless of current working dir
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
    load_dotenv(env_path)

    # config dari environment variables
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")
    if not app.config['SECRET_KEY']:
        raise ValueError("SECRET_KEY environment variable not set. This is critical for Flask security.")

    app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
    if not app.config['JWT_SECRET_KEY']:
        raise ValueError("JWT_SECRET_KEY environment variable not set. This is critical for JWT security.")
    
    # Default to 'development'
    app.config['FLASK_ENV'] = os.getenv('FLASK_ENV', 'development')

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
    # CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    # CORS(app, supports_credentials=True, origins=["http://localhost:3000"], allow_headers=["Authorization", "Content-Type"])

    allowed_origins = [
        origin.strip() for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,https://ibc.itr-compass.co.id"
        ).split(",") if origin.strip()
    ]

    CORS(
        app, 
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=["Authorization", "Content-Type"],
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    )

    # init extensions
    db.init_app(app)
    mail.init_app(app)
    socketio.init_app(app, cors_allowed_origins=allowed_origins)

    from app.models.renault_arrival_form import ArrivalFormModel_RT
    from app.models.manitou_arrival_form import ArrivalFormModel_MA
    from app.models.sdlg_arrival_form import ArrivalFormModel_SDLG
    from app.models.mst_unit_type_model import MstUnitType

    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    from app.routes.arrival_check_routes import arrival_check_bp 
    app.register_blueprint(arrival_check_bp, url_prefix='/api/arrival-check') 
    
    from app.routes.unit_type_routes import unit_type_bp
    app.register_blueprint(unit_type_bp, url_prefix='/api/unit-types')

    from app.routes.maintenance_check_routes import maintenance_api_bp
    app.register_blueprint(maintenance_api_bp)

    from app.routes.customer_routes import customer_bp
    app.register_blueprint(customer_bp)

    from app.routes.accessories_routes import mst_accessories_bp
    app.register_blueprint(mst_accessories_bp)

    from app.routes.package_routes import mst_packages_bp
    app.register_blueprint(mst_packages_bp)
    
    from app.routes.ibc_routes import ibc_bp 
    app.register_blueprint(ibc_bp)

    from app.routes.wo_number_routes import wo_number_bp
    app.register_blueprint(wo_number_bp)

    from app.routes.pdi_check_routes import pdi_bp
    app.register_blueprint(pdi_bp)

    from app.routes.commissioning_form_routes import commissioning_bp
    app.register_blueprint(commissioning_bp)

    from app.routes.province_routes import province_bp
    app.register_blueprint(province_bp)

    from app.routes.arrival_check_log_routes import arrival_check_log_bp
    app.register_blueprint(arrival_check_log_bp)

    from app.routes.maintenance_check_log_routes import storage_maintenance_log_bp
    app.register_blueprint(storage_maintenance_log_bp)

    from app.routes.pdi_check_log_routes import pdi_check_log_bp
    app.register_blueprint(pdi_check_log_bp)

    from app.routes.commissioning_form_log_routes import commissioning_log_bp
    app.register_blueprint(commissioning_log_bp)

    from app.routes.ibc_log_routes import ibc_log_bp
    app.register_blueprint(ibc_log_bp)

    from app.routes.user_routes import user_bp
    app.register_blueprint(user_bp)

    from app.routes.kho_routes import kho_bp
    app.register_blueprint(kho_bp)

    from app.routes.kho_log_routes import kho_log_bp
    app.register_blueprint(kho_log_bp)

    from app.routes.notifications_routes import notifications_bp
    app.register_blueprint(notifications_bp)

    from app.sockets import register_socket_events
    register_socket_events(socketio)

    return app
