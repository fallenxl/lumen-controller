import asyncio
import json
import websockets

websocket_clients = set()

async def websocket_handler(websocket, path):
    """Maneja conexiones de clientes WebSocket."""
    websocket_clients.add(websocket)
    print("🟢 Cliente WebSocket conectado")

    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Mensaje WebSocket recibido: {data}")
    except:
        pass
    finally:
        websocket_clients.remove(websocket)
        print("🔴 Cliente WebSocket desconectado")

async def websocket_server():
    """Inicia el servidor WebSocket"""
    async with websockets.serve(websocket_handler, "0.0.0.0", 8775):
        print("🌐 WebSocket Server iniciado en ws://0.0.0.0:8775")
        await asyncio.Future()  # Mantener el servidor corriendo
