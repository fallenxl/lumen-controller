import asyncio
import json
from src.config import APPLICATION_ID, COMMANDS, WS_PORT
from datetime import datetime
from websockets.asyncio.server import serve

websocket_clients = set()

async def websocket_handler(websocket):
    websocket_clients.add(websocket)
    print_log(f"Cliente WebSocket conectado ({len(websocket_clients)} clientes)")
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("devEui") and data.get("valveStatus"):
                print_log(f"Actualizando estado de la válvula para {data['devEui']} a {data['valveStatus']}")
                await update_device_valve_status(data["devEui"], data["valveStatus"])
    except Exception as e:
        print_log(f"Error inesperado: {e}")
    finally:
        websocket_clients.remove(websocket)
        print_log("Cliente WebSocket desconectado")

async def websocket_server():
    """Inicia el servidor WebSocket"""
    async with serve(websocket_handler, "0.0.0.0", WS_PORT, ping_interval=20, ping_timeout=20) as server:
        print_log(f"Servidor WebSocket iniciado en ws://localhost:{WS_PORT}")
        await server.serve_forever()
        await asyncio.Future()  # Mantener el servidor en ejecución

async def update_device_valve_status(devEui, valveStatus):
    """Envía un comando MQTT para actualizar el estado de la válvula."""
    topic = f"application/{APPLICATION_ID}/device/{devEui}/command/down"
    payload = {
        "devEui": devEui,
        "confirmed": True,
        "fPort": 26,
        "data": COMMANDS[valveStatus],
    }
    # Publicar el mensaje MQTT
    from src.mqtt_client import publish_message
    publish_message(topic, json.dumps(payload))
    
def print_log(message):
    """Imprime un mensaje en la consola."""
    # formato: [HH:MM:SS] mensaje 
    print(f"[{datetime.now().strftime('%H:%M:%S')}][ws] {message}")