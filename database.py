import sqlite3

# Conectar a la base de datos SQLite
conn = sqlite3.connect("./database/data.db", check_same_thread=False)
cursor = conn.cursor()

# Crear la tabla si no existe
cursor.execute("""
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
""")
conn.commit()

def update_device(devEui, data):
    """Inserta o actualiza un dispositivo en la base de datos."""
    cursor.execute("""
        INSERT INTO devices (devEui, valveStatus, lastUpdate)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(devEui) DO UPDATE SET valveStatus = excluded.valveStatus, lastUpdate = CURRENT_TIMESTAMP
    """, (devEui, data["valveStatus"]))
    conn.commit()
