import asyncio
from mqtt_client import connect_mqtt, start_mqtt, process_mqtt_messages
from websocket_server import websocket_server

async def main():
    """Ejecuta MQTT y WebSocket en paralelo"""
    global loop
    loop = asyncio.get_event_loop()

    connect_mqtt()  # Conectar al broker antes de iniciar MQTT

    await asyncio.gather(
        start_mqtt(),
        websocket_server(),
        process_mqtt_messages(),
    )

if __name__ == "__main__":
    asyncio.run(main())
