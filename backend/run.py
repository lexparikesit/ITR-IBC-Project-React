from app import create_app, db
from app.models.models import User

app = create_app()

with app.app_context():
    db.create_all()
    print("Tables created successfully!")

if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)