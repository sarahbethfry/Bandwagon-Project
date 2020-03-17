from jinja2 import StrictUndefined
from flask import Flask, flash, request, redirect, session, render_template, jsonify, send_from_directory
from flask_debugtoolbar import DebugToolbarExtension
import datetime

from model import User, UserEvents, db, connect_to_db

app = Flask(__name__)
app.secret_key = "HORSE"
app.jinja_env.undefined = StrictUndefined

@app.route("/", methods=['GET'])
def index():
    return render_template("artistMap.html")

@app.route("/artist")
def artist_search():
    return render_template("artistMap.html")

@app.route("/citydate")
def city_date_search():
    return render_template("cityMap.html")

@app.route("/register", methods=['GET'])    
def register_page():
    return render_template("userRegister.html")

@app.route("/register", methods=['POST'])
def register_process():
    """Process registration."""
    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")
   
    new_user = User(username=username, email=email, password=password)

    same_email = User.query.filter_by(email=email).first()

    if same_email:
        flash(f"{same_email} already exitsts. Please login.")
        return redirect("/")

    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.user_id

    flash(f"Welcome, {new_user.username}")
    return redirect("/")


# @app.route("/", methods=['GET'])
# def login_page():
#     return render_template("base.html")

@app.route("/", methods=['POST'])
def login_process():
    email = request.form["email"]
    password = request.form["password"]

    user = User.query.filter_by(email=email).first()

    if not user:
        flash("No such user")
        return redirect ("/")
    if user.password != password:
        flash("Incorrect Password")
        return redirect ("/")

    session["user_id"] = user.user_id

    flash(f"Hello, {user.username}")
    return redirect("/")

@app.route('/userevents/<int:user_id>', methods=['GET'])
def show_user_events(user_id):

    user = UserEvents.query.filter_by(user_id=user_id).all()
        
    return render_template('userEvents.html', user=user)


@app.route('/userevents', methods=['POST'])
def add_user_events():    
    if "user_id" in session:
        user_id = session["user_id"]
        event_name = request.form["event_name"]
        date = request.form["event_date"] 
        venue_name = request.form["event_venue"]
        songkick_url = request.form["event_url"]       

        new_event = UserEvents(user_id=user_id, event_name=event_name, date=date, venue_name=venue_name, songkick_url=songkick_url)
        
        same_event = UserEvents.query.filter_by(event_name=event_name).first()
        
        if same_event:
            flash(f"{same_event} already in your shows")
            return redirect(f"/{user_id}") 

        db.session.add(new_event)
        db.session.commit()

        flash(f"Event was added!")
        return redirect(f'/userevents/{user_id}')
    else:
        flash(f"You need to be logged in to do that!")
        return redirect("/")


@app.route('/logout')
def logout():
    """Log out."""
    del session["user_id"]
    flash("Logged Out.")
    return redirect("/")


if __name__ == "__main__":
    app.debug = False
    connect_to_db(app)

    app.run(port=5000, host='0.0.0.0')