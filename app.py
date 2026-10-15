
from flask import Flask, render_template, send_from_directory, request, redirect, url_for
from pymongo import MongoClient


import os

app = Flask(__name__)

@app.route("/node_modules/<path:filename>")
def serve_node_modules(filename):
    base_folder = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "node_modules"
    )
    return send_from_directory(base_folder, filename)


MONGO_URI = os.environ.get(
    "MONGO_URI",
    "mongodb://localhost:27017/"
)

client = MongoClient(MONGO_URI)
db = client["YourParallelWorldDB"]


@app.route("/save-character", methods=["POST"])
def save_character():
    name = request.form.get("name")
    title = request.form.get("title")
    description = request.form.get("description")

    db.characters.insert_one({
        "name": name,
        "title": title,
        "description": description
    })

    return redirect(url_for("home"))


@app.route("/")
def home():
    characters = list(db.characters.find())

    return render_template(
        "index.html",
        characters=characters
    )

if __name__ == "__main__":
    app.run(debug=True)
