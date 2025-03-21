import os

# Obtener variables desde el entorno o usar valores predeterminados
BROKER = os.environ.get("BROKER", "0.0.0.0")
PORT = int(os.environ.get("PORT", 1883))
USERNAME = os.environ.get("USERNAME", "admin")
PASSWORD = os.environ.get("PASSWORD", "admin")

APPLICATION_ID = os.environ.get("APPLICATION_ID", "")

TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}