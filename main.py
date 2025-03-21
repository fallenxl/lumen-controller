import asyncio
import threading
from src.mqtt_client import connect_mqtt, start_mqtt, process_mqtt_messages, set_queue
from src.websocket_server import websocket_server
from src.api_server import start_flask  # Importamos la función que arrancará Flask

async def main():
    """Ejecuta MQTT, WebSocket y API Flask en paralelo"""
    loop = asyncio.get_running_loop()
    mqtt_message_queue = asyncio.Queue()

    set_queue(mqtt_message_queue)  # Asegurar que la cola se usa correctamente en mqtt_client

    connect_mqtt()  # Conectar al broker antes de iniciar MQTT

    # Iniciar Flask en un hilo separado
    flask_thread = threading.Thread(target=start_flask, daemon=True)
    flask_thread.start()

    # Ejecutar las tareas de MQTT y WebSocket en paralelo
    await asyncio.gather(
        start_mqtt(),
        websocket_server(),
        process_mqtt_messages(mqtt_message_queue),
    )

if __name__ == "__main__":
    asyncio.run(main())
