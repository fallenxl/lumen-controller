import sqlite3
from src.config import APPLICATION_ID
import os
import bcrypt
# crear carpeta database si no existe
if not os.path.exists("./database"):
    os.makedirs("./database")

# Conectar a la base de datos SQLite
conn = sqlite3.connect("./database/data.db", check_same_thread=False)
cursor = conn.cursor()

# Crear la tabla si no existe
cursor.execute(
    """
CREATE TABLE IF NOT EXISTS devices (
    devEui TEXT PRIMARY KEY,
    valveStatus TEXT,
    emptyPipe BOOLEAN,
    temperatureAlarm BOOLEAN,
    overRange BOOLEAN,
    leakage BOOLEAN,
    lowBattery BOOLEAN,
    burst BOOLEAN,
    reverseFlow BOOLEAN,
    applicationId TEXT,
    name TEXT,
    location TEXT,
    lastUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    batteryLevel DECIMAL(10, 2),
    totalConsumption DECIMAL(5, 2)
)
"""
)


# Crear la tabla users si no existe
cursor.execute(
    """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""
)

conn.commit()



def update_device(devEui, data, control_code):
    if control_code == 129:
        # Insertar o actualizar el último telemetry por dispositivo
        cursor.execute(
            """
            INSERT INTO devices (
                devEui,valveStatus,
                emptyPipe, temperatureAlarm, overRange,
                leakage, lowBattery, burst, reverseFlow, applicationId, lastUpdate, batteryLevel, totalConsumption, name
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?, ?, ?)
            ON CONFLICT(devEui) DO UPDATE SET
                valveStatus = excluded.valveStatus,
                emptyPipe = excluded.emptyPipe,
                temperatureAlarm = excluded.temperatureAlarm,
                overRange = excluded.overRange,
                leakage = excluded.leakage,
                lowBattery = excluded.lowBattery,
                burst = excluded.burst,
                reverseFlow = excluded.reverseFlow,
                applicationId = excluded.applicationId,
                lastUpdate = datetime('now', 'localtime'),
                batteryLevel = excluded.batteryLevel,
                totalConsumption = excluded.totalConsumption,
                name = excluded.name
            """,
            (
                devEui,
                data.get("valveStatus"),
                data["alarms"]["emptyPipe"],
                data["alarms"]["temperatureAlarm"],
                data["alarms"]["overRange"],
                data["alarms"]["leakage"],
                data["alarms"]["lowBattery"],
                data["alarms"]["burst"],
                data["alarms"]["reverseFlow"],
                APPLICATION_ID,
                data.get("batteryPercentage"),
                data.get("totalConsumption"),
                data.get("name")
            ),
        )
    elif control_code == 132:
        # Insertar o actualizar el último telemetry por dispositivo
        cursor.execute(
            """
            INSERT INTO devices (
                devEui,valveStatus,lastUpdate
            ) VALUES (?, ? , CURRENT_TIMESTAMP)
            ON CONFLICT(devEui) DO UPDATE SET
                valveStatus = excluded.valveStatus,
                lastUpdate = CURRENT_TIMESTAMP
            """,
            (devEui, data.get("valveStatus")),
        )
    conn.commit()

def create_default_admin():
    # Verificar si hay al menos un usuario en la tabla
    cursor.execute("SELECT COUNT(*) FROM users")
    user_count = cursor.fetchone()[0]

    if user_count == 0:
        admin_username = "admin"
        admin_password = "admin"  # Contraseña por defecto
        admin_email = "admin@example.com"
        admin_name = "Administrator"

        # Hashear la contraseña
        hashed_password = bcrypt.hashpw(admin_password.encode("utf-8"), bcrypt.gensalt())

        # Insertar usuario admin
        cursor.execute(
            "INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)",
            (admin_username, hashed_password.decode("utf-8"), admin_name, admin_email),
        )
        conn.commit()
        print("Usuario admin creado exitosamente.")
    else:
        print("Ya existen usuarios en la base de datos. No se creará el usuario admin.")

# Crear el usuario por defecto solo si no hay usuarios
create_default_admin()