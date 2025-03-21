import asyncio
import json
import websockets
from src.config import APPLICATION_ID, COMMANDS


websocket_clients = set()

async def websocket_handler(websocket, path):
    """Maneja conexiones de clientes WebSocket."""
    websocket_clients.add(websocket)
    print("🟢 Cliente WebSocket conectado")

    try:
        async for message in websocket:
            data = json.loads(message)
            if "devEui" in data and "valveStatus" in data:
                await update_device_valve_status(data["devEui"], data["valveStatus"])
    except:
        pass
    finally:
        websocket_clients.remove(websocket)
        print("🔴 Cliente WebSocket desconectado")

async def websocket_server():
    """Inicia el servidor WebSocket"""
    async with websockets.serve(websocket_handler, "0.0.0.0", 8765):
        print("🌐 WebSocket Server iniciado en ws://0.0.0.0:8765")
        await asyncio.Future()  # Mantener el servidor corriendo

async def update_device_valve_status(devEui, valveStatus):
    """Envía un comando MQTT para actualizar el estado de la válvula."""
    print(f"🔄 Actualizando estado de válvula para {devEui}")
    topic = f"application/{APPLICATION_ID}/device/{devEui}/command/down"
    payload = {
        "devEui": devEui,
        "confirmed": True,
        "fPort": 26,
        "data": COMMANDS[valveStatus],
    }

    print(payload, topic)

    # Publicar el mensaje MQTT
    from src.mqtt_client import publish_message
    publish_message(topic, json.dumps(payload))