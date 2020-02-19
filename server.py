from jinja2 import StrictUndefined
from flask import Flask, render_template, jsonify, send_from_directory
from flask_debugtoolbar import DebugToolbarExtension


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("artistMap.html")


if __name__ == "__main__":
    app.debug = True
    # DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
