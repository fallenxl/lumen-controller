import paho.mqtt.client as mqtt
import sqlite3
import json
import asyncio
import websockets
from asyncio import Queue

# Configuración del broker MQTT
BROKER = "192.168.88.85"
PORT = 1883
APPLICATION_ID = "8f72266a-4f8d-4e5e-9229-47bd0930049d"
TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}

# Lista de clientes WebSocket conectados
websocket_clients = set()

# Cola para pasar los mensajes del hilo MQTT al hilo principal
mqtt_message_queue = Queue()

# Conectar a la base de datos SQLite
conn = sqlite3.connect("../database/data.db", check_same_thread=False)
cursor = conn.cursor()

# Crear la tabla con devEui como clave primaria
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


# Callback cuando el cliente se conecta al broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Conectado a MQTT")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Error de conexión: {rc}")


# Callback cuando se recibe un mensaje
def on_message(client, userdata, msg):
    # Usamos loop.call_soon_threadsafe para pasar el mensaje al hilo principal
    loop.call_soon_threadsafe(mqtt_message_queue.put_nowait, msg.payload.decode())


# Procesar el mensaje recibido
async def process_message(message):
    try:
        data = json.loads(message)  # Convertir el mensaje a JSON
        device_info = data.get("deviceInfo", {})
        object_data = data.get("object", {})
        control_code = object_data.get("controlCode")
        devEui = device_info.get("devEui")  # Identificador único del dispositivo
        print(f"📩 Recibido mensaje de {devEui} con data: {object_data}")
        if not devEui:
            print("❌ No se encontró devEui en el mensaje")
            return

        if control_code == 129:
            # Insertar o actualizar el último telemetry por dispositivo
            cursor.execute(
                """
            INSERT INTO devices (
                devEui,valveStatus,
                emptyPipe, temperatureAlarm, overRange,
                leakage, lowBattery, burst, reverseFlow, applicationId, lastUpdate, batteryLevel, totalConsumption
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
                totalConsumption = excluded.totalConsumption
            """,
                (
                    devEui,
                    object_data.get("valveStatus"),
                    object_data["alarms"]["emptyPipe"],
                    object_data["alarms"]["temperatureAlarm"],
                    object_data["alarms"]["overRange"],
                    object_data["alarms"]["leakage"],
                    object_data["alarms"]["lowBattery"],
                    object_data["alarms"]["burst"],
                    object_data["alarms"]["reverseFlow"],
                    APPLICATION_ID,
                    object_data.get("batteryPercentage"),
                    object_data.get("totalConsumption")
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
                (
                    devEui,
                    object_data.get("valveStatus")
                ),
            )
        conn.commit()  # Guardar los cambios en la base de datos
        print(f"✅ Datos de {devEui} guardados/actualizados en SQLite")

        # Enviar mensaje a todos los clientes WebSocket conectados
        if websocket_clients:
            message_json = json.dumps({"devEui": devEui, **object_data})
            await asyncio.gather(
                *(client.send(message_json) for client in websocket_clients)
            )
            print(f"📡 Enviado a {len(websocket_clients)} clientes WebSocket")
    except Exception as e:
        print(f"❌ Error procesando mensaje: {e}")


# Servidor WebSocket para enviar datos al frontend
async def websocket_server():
    async with websockets.serve(websocket_handler, "0.0.0.0", 8775):
        print("🌐 WebSocket Server iniciado en ws://0.0.0.0:8775")
        await asyncio.Future()  # Mantener el servidor corriendo


# Manejar cada cliente WebSocket
async def websocket_handler(websocket, path):
    websocket_clients.add(websocket)
    print("🟢 Cliente WebSocket conectado")

    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Data recibida: {data}")
            if "devEui" in data and "valveStatus" in data:
                print(f"Data recibida")
                await update_device_valve_status(data["devEui"], data["valveStatus"])
    except:
        pass
    finally:
        websocket_clients.remove(websocket)
        print("🔴 Cliente WebSocket desconectado")


# Configurar cliente MQTT
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Conectar al broker MQTT
client.connect(BROKER, PORT, 60)


# Iniciar el loop MQTT en un hilo separado
async def start_mqtt():
    client.loop_start()


# Procesar mensajes de la cola en el hilo principal
async def process_mqtt_messages():
    while True:
        message = await mqtt_message_queue.get()
        await process_message(message)


async def update_device_valve_status(devEui, valveStatus):
    print(f"🔄 Actualizando estado de válvula para {devEui}")
    topic = (
        f"application/{APPLICATION_ID}/device/{devEui}/command/down"
    )
    payload = {
        "devEui": devEui,
        "confirmed": True,
        "fPort": 26,
        "data": COMMANDS[valveStatus],
    }
    
    print(payload, topic)
    
    response = client.publish(topic, json.dumps(payload))
    print(f"📡 Enviado comando a {devEui} con estado {valveStatus}, response: {response}")


# Ejecutar MQTT y WebSocket en paralelo
async def main():
    # Obtener el bucle de eventos principal
    global loop
    loop = asyncio.get_event_loop()

    # Iniciar tanto el cliente MQTT como el servidor WebSocket y procesar los mensajes
    await asyncio.gather(
        start_mqtt(),
        websocket_server(),
        process_mqtt_messages(),
    )


if __name__ == "__main__":
    asyncio.run(main())
