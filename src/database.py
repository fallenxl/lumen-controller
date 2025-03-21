import sqlite3
from src.config import APPLICATION_ID

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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), ?, ?)
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
