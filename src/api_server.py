from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import sqlite3
import bcrypt
import datetime
from src.config import JWT_SECRET

app = Flask(__name__)
CORS(app)

# Configuración de JWT
app.config["JWT_SECRET_KEY"] = JWT_SECRET  # Cambia esto en producción
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)
jwt = JWTManager(app)

def get_database():
    return sqlite3.connect("./database/data.db", check_same_thread=False)

# Ruta para registrar usuarios
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()

    # Verificar si el usuario ya existe
    cursor.execute("SELECT id FROM users WHERE username = ?", (data["username"],))
    if cursor.fetchone():
        db.close()
        return jsonify({"error": "El usuario ya existe"}), 400

    # Hashear la contraseña
    hashed_password = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    # Insertar el usuario en la base de datos
    cursor.execute(
        "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
        (data["username"], hashed_password.decode("utf-8"), data["name"], data["email"]),
    )
    db.commit()
    db.close()

    return jsonify({"message": "Usuario registrado exitosamente"}), 201

# Ruta para iniciar sesión
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()
    cursor.execute("SELECT id, password FROM users WHERE username = ?", (data["username"],))
    user = cursor.fetchone()
    db.close()
    if not user or not bcrypt.checkpw(data["password"].encode("utf-8"), user[1].encode("utf-8")):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Crear el token de acceso
    access_token = create_access_token(identity=data["username"])
    return jsonify({"access_token": access_token}), 200


# refresh token
@app.route("/refresh", methods=["POST"])
@jwt_required()
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify(access_token=access_token), 200

# Ruta protegida para obtener dispositivos
@app.route("/devices", methods=["GET"])
@jwt_required()
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

# Get device by id -> string
@app.route("/devices/<string:devEui>", methods=["GET"])
@jwt_required()
def get_device_by_id(devEui):
    db = get_database()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM devices WHERE devEui = ?", (devEui,))
    device = cursor.fetchone()
    db.close()

    if device:
        columns = [column[0] for column in cursor.description]
        return jsonify(dict(zip(columns, device)))
    else:
        return jsonify({"error": "Dispositivo no encontrado"}), 404
    

# Ruta protegida para actualizar un dispositivo
@app.route("/devices", methods=["PATCH"])
@jwt_required()
def update_device():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()
    cursor.execute("UPDATE devices SET name = ?, location = ?, valveStatus = ? WHERE devEui = ?", 
                   (data["name"], data["location"], data["valveStatus"], data["devEui"]))
    db.commit()
    db.close()
    return jsonify({"success": True})


# Ruta protegida para eliminar un dispositivo
@app.route("/devices", methods=["DELETE"])
@jwt_required()
def delete_device():
    data = request.get_json()
    db = get_database()
    cursor = db.cursor()
    cursor.execute("DELETE FROM devices WHERE devEui = ?", (data["devEui"],))
    db.commit()
    db.close()
    return jsonify({"success": True})

def start_flask():
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
