import json
from src.database import update_device
from src.websocket_server import websocket_clients
import asyncio
from datetime import datetime

async def process_message(message):
    """Procesa un mensaje MQTT recibido."""
    try:
        data = json.loads(message)  # Convertir el mensaje a JSON
        device_info = data.get("deviceInfo", {})
        object_data = data.get("object", {})
        devEui = device_info.get("devEui")

        if not devEui:
            print_log(f"devEui no encontrado en el mensaje: {message}")
            return
        
        object_data["name"] = device_info.get("deviceName")

        updated_ts = update_device(devEui, object_data, object_data.get("controlCode"))

        # Enviar datos a todos los clientes WebSocket conectados
        if websocket_clients:
            
            message_json = json.dumps({"devEui": devEui, "lastUpdate": updated_ts, **object_data})
            await asyncio.gather(*(client.send(message_json) for client in websocket_clients))

        print_log(f"Datos de {devEui} guardados/actualizados en SQLite")

    except Exception as e:
        print_log(f"Error procesando mensaje: {e}")


async def process_command(devEui, command):
    """Procesa un comando recibido a través de WebSocket."""
    try:
        update_device(devEui, {}, command)
    except Exception as e:
        print_log(f"Error procesando comando: {e}")
    

def print_log(message):
    print(f"[{datetime.now().strftime('%H:%M:%S')}][mqtt] {message}")