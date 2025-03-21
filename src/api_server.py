from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

def get_database():
    return sqlite3.connect("./database/data.db")

@app.route("/devices", methods=["GET"])
def get_devices():
    db = get_database()
    cursor = db.cursor()
    
    cursor.execute("PRAGMA table_info(devices)")
    columns = [column[1] for column in cursor.fetchall()]
    cursor.execute("SELECT * FROM devices")
    rows = cursor.fetchall()
    db.close()
    
    rows = [dict(zip(columns, row)) for row in rows]
    return jsonify({"devices": rows})

@app.route("/devices", methods=["PATCH"])
def update_device():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()
    cursor.execute("UPDATE devices SET name = ?, location = ?, valveStatus = ? WHERE devEui = ?", 
                   (data["name"], data["location"], data["valveStatus"], data["devEui"]))
    db.commit()
    db.close()
    return jsonify({"success": True})

@app.route("/devices", methods=["DELETE"])
def delete_device():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()
    cursor.execute("DELETE FROM devices WHERE devEui = ?", (data["devEui"],))
    db.commit()
    db.close()
    return jsonify({"success": True})

def start_flask():
    """Inicia el servidor Flask en modo no bloqueante."""
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
