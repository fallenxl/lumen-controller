import paho.mqtt.client as mqtt
import asyncio
from asyncio import Queue
from config import BROKER, PORT, TOPIC
from handlers import process_message

mqtt_message_queue = Queue()

# Configurar cliente MQTT
client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Conectado a MQTT")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Error de conexión: {rc}")

def on_message(client, userdata, msg):
    """Pasa el mensaje MQTT al hilo principal de asyncio."""
    loop.call_soon_threadsafe(mqtt_message_queue.put_nowait, msg.payload.decode())

client.on_connect = on_connect
client.on_message = on_message

def connect_mqtt():
    """Conectar al broker MQTT"""
    client.connect(BROKER, PORT, 60)

async def start_mqtt():
    """Inicia el loop MQTT en un hilo separado"""
    client.loop_start()

async def process_mqtt_messages():
    """Procesa los mensajes de MQTT en la cola"""
    while True:
        message = await mqtt_message_queue.get()
        await process_message(message)
