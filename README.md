# Previfuego Backend — Instrucciones de despliegue

## Archivos en esta carpeta
- app.py — servidor principal
- cert_generator.py — generador de certificados PDF
- logo_sin_fondo.png — logo Previfuego sin fondo
- requirements.txt — librerías necesarias
- Procfile — instrucciones para Railway
- railway.json — configuración Railway

## Pasos para subir a Railway

### 1. Subir a GitHub
1. Ve a github.com y haz login
2. Clic en "New repository"
3. Nombre: previfuego-backend
4. Clic "Create repository"
5. Sube TODOS los archivos de esta carpeta

### 2. Conectar Railway con GitHub
1. Ve a railway.app y haz login
2. Clic "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona "previfuego-backend"
5. Railway empieza a construir automáticamente

### 3. Configurar variables de entorno en Railway
En tu proyecto Railway, ve a "Variables" y agrega:
- EMAIL_USER = ventas_previfuego@hotmail.com
- EMAIL_PASS = (tu contraseña de Outlook)

### 4. Obtener tu URL
Railway te da una URL como: https://previfuego-backend-xxxx.railway.app
Esa URL va en la app de Raúl.
