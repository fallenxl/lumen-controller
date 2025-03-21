import paho.mqtt.client as mqtt
import asyncio
from src.config import BROKER, PORT, TOPIC
from src.handlers import process_message

mqtt_message_queue = None  # Inicialmente vacía

# Configurar cliente MQTT
client = mqtt.Client()

def set_queue(queue):
    """Permite que main.py pase la cola correcta"""
    global mqtt_message_queue
    mqtt_message_queue = queue

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Conectado a MQTT")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Error de conexión: {rc}")

def on_message(client, userdata, msg):
    """Pasa el mensaje MQTT al hilo principal de asyncio."""
    if mqtt_message_queue:
        asyncio.run_coroutine_threadsafe(
            mqtt_message_queue.put(msg.payload.decode()),
            asyncio.get_running_loop()
        )

client.on_connect = on_connect
client.on_message = on_message

def connect_mqtt():
    """Conectar al broker MQTT"""
    client.connect(BROKER, PORT, 60)

async def start_mqtt():
    """Inicia el loop MQTT en un hilo separado"""
    client.loop_start()

async def process_mqtt_messages(queue):
    """Procesa los mensajes de MQTT en la cola"""
    while True:
        message = await queue.get()
        await process_message(message)
