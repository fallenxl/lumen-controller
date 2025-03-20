# Usa Python como base
FROM python:3.10

# Instala Node.js y npm
RUN apt-get update && apt-get install -y nodejs npm

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del backend
COPY . .

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Instala dependencias del frontend
WORKDIR /app/ui
RUN npm install && npm run build  # Asegúrate de que el frontend se construya

# Regresa al directorio raíz
WORKDIR /app

# Expone los puertos (ajústalos según necesidad)
EXPOSE 5000 3000 

# Ejecuta frontend y backend en paralelo
CMD ["sh", "-c", "cd app && python main.py & cd ui && npm start"]
