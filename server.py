from jinja2 import StrictUndefined
from flask import Flask, flash, request, redirect, session, render_template, jsonify, send_from_directory
from flask_debugtoolbar import DebugToolbarExtension

from model import User, UserEvents, db, connect_to_db

app = Flask(__name__)
app.secret_key = "HORSE"
app.jinja_env.undefined = StrictUndefined

@app.route("/")
def index():
    return render_template("artistMap.html")

@app.route("/register", methods=['GET'])    
def register_page():
    return render_template("register_form.html")

@app.route("/register", methods=['POST'])
def register_process():
    """Process registration."""

    # Get form variables
    
    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")
   
    new_user = User(username=username, email=email, password=password)

    db.session.add(new_user)
    db.session.commit()

    flash(f"User {email} added.")
    return redirect("/login")

@app.route("/login", methods=['GET'])
def login_page():
    return render_template("login_form.html")

@app.route("/login", methods=['POST'])
def login_process():
    email = request.form["email"]
    password = request.form["password"]

    # if email == None or password == None:
    #     return jsonify({'error' : 'Missing data!'})


    user = User.query.filter_by(email=email).first()

    if not user:
        flash("No such user")
        return redirect ("/login")
    if user.password != password:
        flash("Incorrect Password")
        return redirect ("/login")

    session["user_id"] = user.user_id

    flash(f"Hello, {user.username}")
    return redirect("/")


@app.route('/logout')
def logout():
    """Log out."""
    del session["user_id"]
    flash("Logged Out.")
    return redirect("/")


if __name__ == "__main__":
    app.debug = True
    connect_to_db(app)
    DebugToolbarExtension(app)

    app.run(port=5000, host='0.0.0.0')