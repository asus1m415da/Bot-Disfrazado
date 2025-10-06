<div align="center">

# 🤖 Bot de Discord Multipropósito

### Bot avanzado con Inteligencia Artificial, descargas multimedia y seguridad integrada

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Características](#-características) • [Instalación](#-instalación-rápida) • [Comandos](#-comandos) • [Configuración](#-configuración) • [Soporte](#-soporte)

</div>

---

## ✨ Características

<table>
<tr>
<td width="50%">

### 🧠 Inteligencia Artificial
- Respuestas contextuales con Google Gemini
- Generación de consejos personalizados
- Creador automático de scripts Roblox Lua
- Sistema de regeneración inteligente

</td>
<td width="50%">

### 📥 Descargas Multimedia
- YouTube a MP3/MP4
- Vista previa antes de descargar
- Límites automáticos de seguridad
- Limpieza automática de archivos

</td>
</tr>
<tr>
<td width="50%">

### 🖼️ Búsqueda Visual
- Imágenes de Google Custom Search
- Fotos de alta calidad desde Pexels
- Videos descargables de Pexels
- Navegación con carrusel interactivo

</td>
<td width="50%">

### 🔒 Seguridad
- Análisis de URLs con VirusTotal
- Vista previa segura de enlaces
- Sistema de logging completo
- Verificación por código único

</td>
</tr>
</table>

---

## 🚀 Instalación Rápida

### Requisitos Previos

```bash
Node.js v18+
npm v9+
Discord Bot Token
Google Gemini API Key
```

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/discord-bot.git
cd discord-bot
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus claves
```

### Paso 4: Iniciar el Bot

```bash
npm start
```

---

## 📋 Comandos

### 🧠 Inteligencia Artificial

| Comando | Descripción |
|---------|-------------|
| `/ia <pregunta>` | Genera respuesta inteligente con IA |
| `/consejo` | Recibe un consejo útil del día |
| `/scripter-ia <idea>` | Genera scripts de Roblox Lua |

### 📥 Multimedia

| Comando | Descripción |
|---------|-------------|
| `/descargar <formato> <url>` | Descarga de YouTube (MP3/MP4) |
| `/info <formato> <url>` | Vista previa del video |
| `/imagen <búsqueda>` | Busca imágenes en Google |
| `/imagenes-public <búsqueda>` | Imágenes de Pexels |
| `/videos-public <búsqueda>` | Videos de Pexels |

### 🔧 Utilidades

| Comando | Descripción |
|---------|-------------|
| `/ping` | Verifica latencia del bot |
| `/sistema` | Información del sistema |
| `/revisar-enlace <url>` | Analiza seguridad de URLs |
| `/ayuda` | Muestra todos los comandos |

### ⚙️ Administración

| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `/enviar-mensaje` | Envía mensaje a través del bot | Todos |
| `/verificar` | Verifica configuración | Admin |
| `/generar-codigo` | Genera código de acceso | Owner |

---

## 🔧 Configuración

### Variables de Entorno Obligatorias

```env
DISCORD_TOKEN=tu_token_discord
CLIENT_ID=tu_client_id
GEMINI_API_KEY=tu_gemini_key
```

### Variables Opcionales (Mejoran Funcionalidad)

```env
GOOGLE_API_KEY=tu_google_key
GOOGLE_CX_ID=tu_cx_id
PEXELS_API_KEY=tu_pexels_key
VT_API_KEY=tu_virustotal_key
LINKPREVIEW_API_KEY=tu_linkpreview_key
LOG_CHANNEL_ID=canal_id_logs
SECRET_PASSWORD=contraseña_secreta
OWNER_ID=tu_discord_id
```

---

## 🎯 Guía de APIs

<details>
<summary>🔑 Discord Bot Token</summary>

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nueva aplicación
3. Ve a "Bot" → "Add Bot"
4. Copia el token
5. Activa los **Privileged Gateway Intents**

</details>

<details>
<summary>🧠 Google Gemini API</summary>

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con Google
3. Genera una API Key
4. Copia la clave

</details>

<details>
<summary>🖼️ Google Custom Search</summary>

1. [Habilita Custom Search API](https://console.cloud.google.com/)
2. Crea credenciales → API Key
3. Configura [Programmable Search Engine](https://programmablesearchengine.google.com/)
4. Copia el Search Engine ID

</details>

<details>
<summary>📷 Pexels API</summary>

1. Regístrate en [Pexels API](https://www.pexels.com/api/)
2. Obtén tu API Key del dashboard
3. Plan gratuito: 200 solicitudes/hora

</details>

<details>
<summary>🔒 VirusTotal API</summary>

1. Regístrate en [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Ve a tu perfil → API Key
3. Plan gratuito: 4 solicitudes/minuto

</details>

---

## 🐳 Docker

### Construir y Ejecutar

```bash
# Construir imagen
docker build -t discord-bot .

# Ejecutar contenedor
docker run -d \
  --name mi-bot \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  discord-bot
```

### Docker Compose

```bash
docker-compose up -d
```

---

## 🛡️ Seguridad

### Buenas Prácticas

- ✅ Nunca compartas tu `.env`
- ✅ Usa `.gitignore` correctamente
- ✅ Rota tus API keys regularmente
- ✅ Marca el repositorio como privado
- ✅ Limita permisos del bot
- ✅ Revisa logs periódicamente

### Sistema de Verificación

El bot incluye un sistema de códigos únicos para comandos premium:

```bash
# Generar código (solo owner)
/generar-codigo prefijo:script_

# Verificar servidor
/scripter-ia idea:mi_script codigo:script_abc123
```

---


## 📊 Límites de APIs

| Servicio | Plan Gratuito |
|----------|---------------|
| Gemini AI | 60 req/min |
| YouTube (ytdl) | Sin límite oficial |
| Pexels | 200 req/hora |
| VirusTotal | 4 req/min |
| LinkPreview | 60 req/hora |
| Google Search | 100 búsquedas/día |

---

## 🐛 Solución de Problemas

<details>
<summary>❌ "An invalid token was provided"</summary>

**Solución:** Regenera el token en Discord Developer Portal y actualiza `.env`

</details>

<details>
<summary>❌ "IA no configurada"</summary>

**Solución:** Obtén una API key de Google Gemini y añádela en `GEMINI_API_KEY`

</details>

<details>
<summary>❌ Comandos no aparecen</summary>

**Solución:** Verifica que `CLIENT_ID` esté configurado y reinicia el bot

</details>

<details>
<summary>❌ Error al descargar de YouTube</summary>

**Causas posibles:**
- Video privado o con restricciones
- Video muy largo (límite: 10 min)
- Archivo muy pesado (límite: 25MB)

</details>

---

## 📈 Roadmap

- [ ] Panel web de administración
- [ ] Sistema de economía con base de datos
- [ ] Música en canales de voz
- [ ] Comandos de moderación avanzados
- [ ] Soporte multi-idioma
- [ ] Sistema de tickets
- [ ] Integración con más APIs

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -m 'Añadir nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 💬 Soporte

¿Necesitas ayuda?

- 📧 Abre un [Issue](https://github.com/tuusuario/discord-bot/issues)
- 📖 Lee la [documentación completa](#)
- 💬 Únete a nuestro [servidor de Discord](#)

---

## 🌟 Agradecimientos

Construido con:

- [Discord.js](https://discord.js.org/) - Librería de Discord
- [Google Gemini](https://ai.google.dev/) - Inteligencia Artificial
- [ytdl-core](https://github.com/fent/node-ytdl-core) - Descargas de YouTube
- [Node.js](https://nodejs.org/) - Runtime JavaScript

---

<div align="center">

### ⭐ Si te gusta el proyecto, dale una estrella

**Hecho con ❤️ para la comunidad de Discord**

[⬆ Volver arriba](#-bot-de-discord-multipropósito)

</div>
