import paho.mqtt.client as mqtt
import asyncio
from src.config import BROKER, PORT, TOPIC, USERNAME, PASSWORD
from src.handlers import process_message
from datetime import datetime
mqtt_message_queue = None
event_loop = None  

client = mqtt.Client()

def set_queue(queue, loop):
    global mqtt_message_queue, event_loop
    mqtt_message_queue = queue
    event_loop = loop  

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print_log(f"conectado al broker MQTT {BROKER}:{PORT}")
        client.subscribe(TOPIC)
    else:
        print(f"❌ Error de conexión: {rc}")

def on_message(client, userdata, msg):
    if mqtt_message_queue and event_loop:
        asyncio.run_coroutine_threadsafe(
            mqtt_message_queue.put(msg.payload.decode()), event_loop
        )

client.on_connect = on_connect
client.on_message = on_message
client.username_pw_set(USERNAME, PASSWORD)

def connect_mqtt():
    client.connect(BROKER, PORT, 60)

async def start_mqtt():
    client.loop_start()

async def process_mqtt_messages(queue):
    while True:
        message = await queue.get()
        await process_message(message)

# 🔥 Mantenemos publish_message aquí, sin importarlo en websocket_server.py
def publish_message(topic, payload):
    client.publish(topic, payload)
    print_log(f"mensaje publicado en {topic}")
    

def print_log(message):
    print(f"[{datetime.now().strftime('%H:%M:%S')}][mqtt] {message}")