""" Model for database in Songpunch project"""

from flask_sqlalchemy import SQAlchemy

# This is the connection to the PostgreSQL database.
db = SQAlchemy()

# Connect the database to our Flask app.
def connect_to_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///songpunch'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = False
    db.app = app
    db.init_app(app)

################################################################
# Create tables and attributes

class Event(db.Model):
    """Event on Songpunch website."""

    __tablename__ = "events"

    event_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    event_name = db.Column(db.String(100), nullable=True)
    venue_id = db.Column(db.Integer, db.ForeignKey('venues.venue_id'), nullable=False)
    date = db.Column(db.DateTime)
    sk_url = db.Column(db.String(200))

    def __repr__(self):
        return f"<Event name:{self.event_name} Date:{self.date}>"

class Venue(db.Model):
    """Venue details on Songpuch website."""

    __tablename__ = "venues"

    venue_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    venue_name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=True)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f"<Venue: {self.venue_name}>"

class Artist(db.Model):
    """Artist details on Songpunch website"""

    __tablename__ = "artists"

    artist_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    artist_name = db.Column(db.String(100), nullable=False)
    on_tour = db.Column(db.Boolean, nullable=False)
    artist_url = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f"<Artist: {self.artist_name} On Tour? {self.on_tour}>"

class ArtistEvent(db.Model):
    """Data model for artist events."""

    __tablename__ = "artist_events"

    artist_event_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('artists.artist_id'),nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)

class User(db.Model):
    """User details on Songpunch website."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f"<User: {self.username} User id: {self.user_id}>"

class UserEvents(db.Model):
    """Data model for users events."""

    __tablename__ = "user_events"

    user_event_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.event_id'), nullable=False)

###############################################################

if __name__ == "__manin__"
"""Helper function that allows you to run this module interactively."""
    from server import app
    connect_to_db(app)
    print("Connected to DB.")



