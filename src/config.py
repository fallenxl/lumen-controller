import os
from dotenv import load_dotenv

# Cargar variables desde el archivo .env
load_dotenv()

# Obtener variables desde el entorno o usar valores predeterminados
BROKER = os.environ.get("BROKER")
PORT = int(os.environ.get("PORT"))
USERNAME = os.environ.get("USERNAME")
PASSWORD = os.environ.get("PASSWORD")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "production")
JWT_SECRET = os.environ.get("JWT_SECRET", "f<j62Q{2[CN^IMG:+<d4R+MLNSwGsxWR%P4yY{HnaauL")

DB_CONNECTION = "/data/data.db" if ENVIRONMENT == "production" else "./data/data.db"
WS_PORT = os.environ.get("WS_PORT", 8765)

APPLICATION_ID = os.environ.get("APPLICATION_ID")

TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}