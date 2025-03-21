import os

# Obtener variables desde el entorno o usar valores predeterminados
BROKER = os.environ.get("BROKER", "192.168.88.85")
PORT = int(os.environ.get("PORT", 1883))
# APPLICATION_ID = os.environ.get("APPLICATION_ID", "8F7226Aa-6f8d-4e5e-9229-67bd09308A94")
APPLICATION_ID = os.environ.get("APPLICATION_ID", "8f72266a-4f8d-4e5e-9229-47bd0930049d")

# Mantener las variables TOPIC y COMMANDS sin cambios
TOPIC = f"application/{APPLICATION_ID}/device/+/event/up"
COMMANDS = {
    "open": "BASgFwBV",
    "closed": "BASgFwCZ"
}