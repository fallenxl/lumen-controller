# Usa una imagen base de Python
FROM python:3.9-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y curl python3 build-essential libsqlite3-dev

# Instalar Node.js y npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm

# Configurar directorio de trabajo
WORKDIR /app

# Copiar e instalar dependencias del backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY . .

# Instalar dependencias del frontend con compilación correcta
WORKDIR /app/ui

# Establecer variable de entorno para evitar errores con @next/swc
ENV NEXT_SKIP_NATIVE_SWC_BUILD=1

RUN pnpm install --ignore-scripts && pnpm build

# Volver al directorio del backend
WORKDIR /app

# Exponer puertos
EXPOSE 1883  
EXPOSE 3000  

# Ejecutar backend y frontend en paralelo
CMD ["sh", "-c", "python main.py & pnpm --prefix ui start --port 3000"]
