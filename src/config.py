import os
from dotenv import load_dotenv

# Cargar variables desde el archivo .env
load_dotenv()

# Obtener variables desde el entorno o usar valores predeterminados
BROKER = os.environ.get("BROKER")
PORT = int(os.environ.get("PORT"))
USERNAME = os.environ.get("USERNAME")
PASSWORD = os.environ.get("PASSWORD")

WS_PORT = os.environ.get("WS_PORT", 8765)

APPLICATION_ID = os.environ.get("APPLICATION_ID")

TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}