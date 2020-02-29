""" Model for database in Bandwagon project"""

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# This is the connection to the PostgreSQL database.
db = SQLAlchemy()

# Connect the database to our Flask app.
def connect_to_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///bandwagon'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = False
    db.app = app
    db.init_app(app)

################################################################
# Create tables and attributes

class User(db.Model):
    """User details on Songpunch website."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<User: {self.username} User id: {self.user_id}>"

class UserEvents(db.Model):
    """Data model for users events."""

    __tablename__ = "user_events"

    user_event_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    event_name = db.Column(db.String(100), nullable=True)
    date = db.Column(db.DateTime)
    venue_name = db.Column(db.String(100), nullable=False)
    songkick_url = db.Column(db.String(500), nullable=True)
    

    user = db.relationship("User", backref="user_events")

    def __repr__(self):
        return f"<Event name: {self.event_name}>"


###############################################################
def set_password(self, password):
    self.password = generate_password_hash(password)

def check_password(self, password):
    return check_password_hash(self.password, password)

if __name__ == "__main__":
    """Helper function that allows you to run this module interactively."""
    from server import app
    connect_to_db(app)
    print("Connected to DB.")



