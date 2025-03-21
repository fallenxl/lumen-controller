import os

# Obtener variables desde el entorno o usar valores predeterminados
BROKER = os.environ.get("BROKER", "192.168.88.85")
PORT = int(os.environ.get("PORT", 1883))
USERNAME = os.environ.get("USERNAME")
PASSWORD = os.environ.get("PASSWORD")

APPLICATION_ID = os.environ.get("APPLICATION_ID", "")

TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}