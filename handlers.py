import json
from database import update_device
from websocket_server import websocket_clients
import asyncio

async def process_message(message):
    """Procesa un mensaje MQTT recibido."""
    try:
        data = json.loads(message)  # Convertir el mensaje a JSON
        device_info = data.get("deviceInfo", {})
        object_data = data.get("object", {})
        devEui = device_info.get("devEui")

        if not devEui:
            print("❌ No se encontró devEui en el mensaje")
            return

        update_device(devEui, object_data)

        # Enviar datos a todos los clientes WebSocket conectados
        if websocket_clients:
            message_json = json.dumps({"devEui": devEui, **object_data})
            await asyncio.gather(*(client.send(message_json) for client in websocket_clients))

        print(f"✅ Datos de {devEui} guardados/actualizados en SQLite")

    except Exception as e:
        print(f"❌ Error procesando mensaje: {e}")
