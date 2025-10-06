// 📦 Dependencias principales
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ActivityType,
  PermissionFlagsBits,
  REST,
  Routes
} = require('discord.js');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
require('dotenv').config();

// 🔑 Variables de entorno con validación
const CONFIG = {
  TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  GOOGLE_CX_ID: process.env.GOOGLE_CX_ID,
  PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  VT_API_KEY: process.env.VT_API_KEY,
  LINKPREVIEW_API_KEY: process.env.LINKPREVIEW_API_KEY,
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,
  SECRET_PASSWORD: process.env.SECRET_PASSWORD || 'default_secret'
};

// 🤖 Inicialización del cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 📁 Crear directorios necesarios
const DIRECTORIES = {
  downloads: path.join(__dirname, 'downloads'),
  data: path.join(__dirname, 'data'),
  logs: path.join(__dirname, 'logs')
};

async function initializeDirectories() {
  for (const [name, dir] of Object.entries(DIRECTORIES)) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Directorio ${name} listo: ${dir}`);
    } catch (error) {
      console.error(`❌ Error creando directorio ${name}:`, error);
    }
  }
}

// 🌀 Mensajes de estado rotativos
const statusMessages = [
  '⚡ Servidor multi-comunidad activo',
  '🎭 Gestionando eventos de Discord',
  '📦 Sistema de descargas optimizado',
  '💀 Escaneando seguridad digital',
  '📡 Transmitiendo con registro avanzado',
  '🔐 Monitoreo de seguridad activo',
  '📷 Motor de búsqueda de imágenes',
  '📹 Procesador de videos integrado',
  '🔗 Análisis de enlaces con VirusTotal',
  '💡 Asistente IA conversacional',
  '🧠 Respuestas potenciadas por Gemini',
  () => `🌐 Conectado a ${client.guilds.cache.size} servidores`
];

let statusIndex = 0;

// 🔁 Actualización de estado
function updateStatus() {
  try {
    const status = statusMessages[statusIndex];
    const text = typeof status === 'function' ? status() : status;

    client.user.setPresence({
      status: 'online',
      activities: [{
        type: ActivityType.Watching,
        name: text
      }]
    });

    statusIndex = (statusIndex + 1) % statusMessages.length;
  } catch (error) {
    console.error('❌ Error actualizando estado:', error.message);
  }
}

// 📝 Sistema de logging mejorado
async function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  try {
    const logFile = path.join(DIRECTORIES.logs, `bot-${new Date().toISOString().split('T')[0]}.log`);
    await fs.appendFile(logFile, logMessage);
  } catch (error) {
    console.error('Error escribiendo log:', error);
  }
}

// 📋 Definición de comandos slash
const commands = [
  {
    name: 'ia',
    description: '🧠 Genera respuesta inteligente usando IA avanzada',
    options: [{
      name: 'pregunta',
      type: 3,
      description: 'Tu pregunta o texto para la IA',
      required: true
    }]
  },
  {
    name: 'descargar',
    description: '📥 Descarga videos de YouTube en MP3 o MP4',
    options: [
      {
        name: 'formato',
        type: 3,
        description: 'Formato de salida',
        required: true,
        choices: [
          { name: 'MP3 (Audio)', value: 'mp3' },
          { name: 'MP4 (Video)', value: 'mp4' }
        ]
      },
      {
        name: 'url',
        type: 3,
        description: 'URL del video de YouTube',
        required: true
      }
    ]
  },
  {
    name: 'info',
    description: '🔍 Muestra información del video antes de descargar',
    options: [
      {
        name: 'formato',
        type: 3,
        description: 'Formato deseado',
        required: true,
        choices: [
          { name: 'MP3', value: 'mp3' },
          { name: 'MP4', value: 'mp4' }
        ]
      },
      {
        name: 'url',
        type: 3,
        description: 'URL del video',
        required: true
      }
    ]
  },
  {
    name: 'imagen',
    description: '🖼️ Busca imágenes usando Google',
    options: [{
      name: 'busqueda',
      type: 3,
      description: '¿Qué imagen deseas buscar?',
      required: true
    }]
  },
  {
    name: 'imagenes-public',
    description: '📷 Busca imágenes públicas de alta calidad en Pexels',
    options: [{
      name: 'busqueda',
      type: 3,
      description: 'Término de búsqueda',
      required: true
    }]
  },
  {
    name: 'videos-public',
    description: '📹 Busca y descarga videos públicos de Pexels',
    options: [{
      name: 'busqueda',
      type: 3,
      description: 'Término de búsqueda',
      required: true
    }]
  },
  {
    name: 'ping',
    description: '🏓 Verifica la latencia del bot'
  },
  {
    name: 'sistema',
    description: '🖥️ Muestra información del sistema y rendimiento'
  },
  {
    name: 'enviar-mensaje',
    description: '📨 Envía un mensaje a través del bot con confirmación',
    options: [{
      name: 'contenido',
      type: 3,
      description: 'Contenido del mensaje',
      required: true
    }]
  },
  {
    name: 'consejo',
    description: '💡 Recibe un consejo útil generado por IA'
  },
  {
    name: 'revisar-enlace',
    description: '🔗 Analiza un enlace con VirusTotal y vista previa',
    options: [{
      name: 'url',
      type: 3,
      description: 'URL a analizar',
      required: true
    }]
  },
  {
    name: 'descifrar',
    description: '🔐 Intenta descifrar la contraseña secreta',
    options: [{
      name: 'clave',
      type: 3,
      description: 'Tu intento de contraseña',
      required: true
    }]
  },
  {
    name: 'scripter-ia',
    description: '📜 Genera scripts de Roblox Lua con IA',
    options: [
      {
        name: 'idea',
        type: 3,
        description: 'Describe el script que necesitas',
        required: true
      },
      {
        name: 'codigo',
        type: 3,
        description: 'Código de verificación (opcional si el servidor está verificado)',
        required: false
      }
    ]
  },
  {
    name: 'generar-codigo',
    description: '🔑 Genera un código de verificación único (solo owner)',
    options: [{
      name: 'prefijo',
      type: 3,
      description: 'Prefijo del código (script_, verify_, auth_, etc.)',
      required: true
    }]
  },
  {
    name: 'verificar',
    description: '✅ Verifica la configuración del bot',
    default_member_permissions: '8'
  },
  {
    name: 'ayuda',
    description: '📚 Muestra todos los comandos disponibles con ejemplos'
  }
];

// 🚀 Registro de comandos
async function registerCommands() {
  if (!CONFIG.CLIENT_ID) {
    console.warn('⚠️ CLIENT_ID no configurado, los comandos no se registrarán automáticamente');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(CONFIG.TOKEN);

  try {
    console.log('🔄 Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(CONFIG.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados exitosamente');
    await logToFile('Comandos slash registrados correctamente');
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
    await logToFile(`Error registrando comandos: ${error.message}`);
  }
}

// ✅ Evento cuando el bot está listo
client.once('ready', async () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║  ✅ Bot conectado exitosamente                ║
  ║  👤 Usuario: ${client.user.tag.padEnd(30)} ║
  ║  🌐 Servidores: ${String(client.guilds.cache.size).padEnd(27)} ║
  ║  👥 Usuarios: ${String(client.users.cache.size).padEnd(29)} ║
  ║  🎭 Estado rotativo: ACTIVO                   ║
  ╚═══════════════════════════════════════════════╝
  `);

  await initializeDirectories();
  await registerCommands();
  await logToFile(`Bot iniciado como ${client.user.tag}`);

  setInterval(updateStatus, 8000);
  updateStatus();
});

// 🎯 Manejador principal de interacciones
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() && !interaction.isButton()) return;

  try {
    if (interaction.isCommand()) {
      await logToFile(`Comando ejecutado: /${interaction.commandName} por ${interaction.user.tag}`);

      switch (interaction.commandName) {
        case 'ia': await handleAICommand(interaction); break;
        case 'descargar': await handleDownloadCommand(interaction); break;
        case 'info': await handleInfoCommand(interaction); break;
        case 'imagen': await handleImageCommand(interaction); break;
        case 'imagenes-public': await handlePexelsImagesCommand(interaction); break;
        case 'videos-public': await handlePexelsVideosCommand(interaction); break;
        case 'ping': await handlePingCommand(interaction); break;
        case 'sistema': await handleSystemCommand(interaction); break;
        case 'enviar-mensaje': await handleSendMessageCommand(interaction); break;
        case 'consejo': await handleAdviceCommand(interaction); break;
        case 'revisar-enlace': await handleCheckLinkCommand(interaction); break;
        case 'descifrar': await handleDecipherCommand(interaction); break;
        case 'scripter-ia': await handleScripterCommand(interaction); break;
        case 'generar-codigo': await handleGenerateCodeCommand(interaction); break;
        case 'verificar': await handleVerifyCommand(interaction); break;
        case 'ayuda': await handleHelpCommand(interaction); break;
      }
    }

    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('❌ Error en interacción:', error);
    await logToFile(`Error en interacción: ${error.message}`);

    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ Error')
      .setDescription('Ocurrió un error procesando tu solicitud. Intenta nuevamente.')
      .setColor(0xff0000)
      .setFooter({ text: 'Si el problema persiste, contacta al administrador' });

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (e) {
      console.error('No se pudo enviar mensaje de error:', e);
    }
  }
});

// 🧠 Comando IA
async function handleAICommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.GEMINI_API_KEY) {
    return interaction.editReply('⚠️ La IA no está configurada. Contacta al administrador del bot.');
  }

  try {
    const pregunta = interaction.options.getString('pregunta');
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(pregunta);
    const response = result.response;
    const texto = response.text();

    if (!texto || texto.trim().length === 0) {
      return interaction.editReply('⚠️ La IA no pudo generar una respuesta. Intenta reformular tu pregunta.');
    }

    const chunks = texto.match(/[\s\S]{1,4000}/g) || [texto];

    for (let i = 0; i < chunks.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(i === 0 ? '🧠 Respuesta de IA' : `🧠 Respuesta de IA (Parte ${i + 1})`)
        .setDescription(chunks[i])
        .setColor(0x0099ff)
        .setFooter({ text: `Respuesta generada por IA • ${new Date().toLocaleString('es-ES')}` });

      if (i === 0) {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('save_ai')
              .setLabel('📩 Guardar en MD')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('delete_ai')
              .setLabel('🗑️ Eliminar')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('regenerate_ai')
              .setLabel('🔁 Regenerar')
              .setStyle(ButtonStyle.Primary)
          );

        await interaction.editReply({ embeds: [embed], components: [row] });
      } else {
        await interaction.followUp({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Error en IA:', error);
    await interaction.editReply('⚠️ Error generando respuesta. La IA puede estar temporalmente no disponible.');
  }
}

// 📥 Comando descargar YouTube
async function handleDownloadCommand(interaction) {
  await interaction.deferReply();

  const formato = interaction.options.getString('formato');
  const url = interaction.options.getString('url');

  if (!ytdl.validateURL(url)) {
    return interaction.editReply('❌ URL de YouTube inválida. Verifica el enlace e intenta nuevamente.');
  }

  try {
    const info = await ytdl.getInfo(url);
    const titulo = info.videoDetails.title;
    const duracion = parseInt(info.videoDetails.lengthSeconds);
    const miniatura = info.videoDetails.thumbnails[0].url;

    // Limitar duración para evitar archivos muy grandes
    if (duracion > 600) { // 10 minutos
      return interaction.editReply('⚠️ El video es demasiado largo. Máximo permitido: 10 minutos.');
    }

    const safeTitle = titulo.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeTitle}_${Date.now()}.${formato}`;
    const filePath = path.join(DIRECTORIES.downloads, fileName);

    const progressEmbed = new EmbedBuilder()
      .setTitle('⏳ Descargando...')
      .setDescription(`**${titulo}**\n\nEsto puede tardar unos momentos...`)
      .setColor(0xffa500);

    await interaction.editReply({ embeds: [progressEmbed] });

    if (formato === 'mp3') {
      const stream = ytdl(url, { quality: 'highestaudio' });
      const writeStream = require('fs').createWriteStream(filePath);
      stream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else {
      const stream = ytdl(url, { quality: 'highest', filter: 'videoandaudio' });
      const writeStream = require('fs').createWriteStream(filePath);
      stream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    }

    const stats = await fs.stat(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Discord tiene límite de 25MB para bots sin nitro
    if (stats.size > 25 * 1024 * 1024) {
      await fs.unlink(filePath);
      return interaction.editReply('⚠️ El archivo supera los 25MB. Discord no permite enviarlo.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎬 ${titulo}`)
      .setDescription(`⏱️ Duración: ${Math.floor(duracion / 60)}:${(duracion % 60).toString().padStart(2, '0')}\n📦 Tamaño: ${sizeMB} MB`)
      .setColor(0x9b59b6)
      .setThumbnail(miniatura)
      .addFields(
        { name: '🎧 Formato', value: formato.toUpperCase(), inline: true },
        { name: '🔗 Enlace', value: `[Ver original](${url})`, inline: true }
      )
      .setFooter({ text: `Descargado por ${interaction.user.tag}` });

    await interaction.editReply({ 
      embeds: [embed], 
      files: [{ attachment: filePath, name: fileName }]
    });

    // Limpiar archivo después de enviar
    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error eliminando archivo:', error);
      }
    }, 5000);

  } catch (error) {
    console.error('Error descargando:', error);
    await interaction.editReply('❌ Error al descargar el video. Verifica que el video sea público y accesible.');
  }
}

// 🔍 Comando info YouTube
async function handleInfoCommand(interaction) {
  await interaction.deferReply();

  const formato = interaction.options.getString('formato');
  const url = interaction.options.getString('url');

  if (!ytdl.validateURL(url)) {
    return interaction.editReply('❌ URL de YouTube inválida.');
  }

  try {
    const info = await ytdl.getInfo(url);
    const titulo = info.videoDetails.title;
    const duracion = parseInt(info.videoDetails.lengthSeconds);
    const miniatura = info.videoDetails.thumbnails[0].url;
    const autor = info.videoDetails.author.name;
    const vistas = parseInt(info.videoDetails.viewCount).toLocaleString('es-ES');

    const embed = new EmbedBuilder()
      .setTitle(`🔎 ${titulo}`)
      .setDescription(`📤 Subido por: ${autor}\n👁️ Vistas: ${vistas}`)
      .setColor(0x3498db)
      .setThumbnail(miniatura)
      .addFields(
        { name: '⏱️ Duración', value: `${Math.floor(duracion / 60)}:${(duracion % 60).toString().padStart(2, '0')}`, inline: true },
        { name: '🎧 Formato elegido', value: formato.toUpperCase(), inline: true }
      )
      .setFooter({ text: 'Presiona el botón para descargar' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`download_${formato}_${Buffer.from(url).toString('base64').substring(0, 50)}`)
          .setLabel('📥 Descargar ahora')
          .setStyle(ButtonStyle.Success)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error obteniendo info:', error);
    await interaction.editReply('❌ No se pudo obtener la información del video.');
  }
}

// 🖼️ Comando búsqueda de imágenes Google
async function handleImageCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.GOOGLE_API_KEY || !CONFIG.GOOGLE_CX_ID) {
    return interaction.editReply('⚠️ La búsqueda de imágenes no está configurada.');
  }

  try {
    const busqueda = interaction.options.getString('busqueda');
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(busqueda)}&searchType=image&key=${CONFIG.GOOGLE_API_KEY}&cx=${CONFIG.GOOGLE_CX_ID}&num=10`;

    const response = await axios.get(url);
    const imagenes = response.data.items
      ?.filter(item => /\.(png|jpg|jpeg|webp|gif)$/i.test(item.link))
      .map(item => item.link) || [];

    if (imagenes.length === 0) {
      return interaction.editReply('⚠️ No se encontraron imágenes para esa búsqueda.');
    }

    await createImageCarousel(interaction, imagenes, busqueda, 'imagen');
  } catch (error) {
    console.error('Error búsqueda imágenes:', error);
    await interaction.editReply('❌ Error al buscar imágenes. Intenta con otro término.');
  }
}

// 📷 Comando Pexels imágenes
async function handlePexelsImagesCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.PEXELS_API_KEY) {
    return interaction.editReply('⚠️ Pexels no está configurado.');
  }

  try {
    const busqueda = interaction.options.getString('busqueda');
    const response = await axios.get(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(busqueda)}&per_page=15`,
      { headers: { Authorization: CONFIG.PEXELS_API_KEY } }
    );

    const imagenes = response.data.photos?.map(photo => photo.src.large) || [];

    if (imagenes.length === 0) {
      return interaction.editReply('⚠️ No se encontraron imágenes en Pexels.');
    }

    await createImageCarousel(interaction, imagenes, busqueda, 'pexels');
  } catch (error) {
    console.error('Error Pexels:', error);
    await interaction.editReply('❌ Error al buscar en Pexels.');
  }
}

// 📹 Comando Pexels videos
async function handlePexelsVideosCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.PEXELS_API_KEY) {
    return interaction.editReply('⚠️ Pexels no está configurado.');
  }

  try {
    const busqueda = interaction.options.getString('busqueda');
    const response = await axios.get(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(busqueda)}&per_page=1`,
      { headers: { Authorization: CONFIG.PEXELS_API_KEY } }
    );

    const videos = response.data.videos;
    if (!videos || videos.length === 0) {
      return interaction.editReply('⚠️ No se encontraron videos.');
    }

    const video = videos[0];
    const videoFile = video.video_files.sort((a, b) => a.width - b.width)[0];
    const videoUrl = videoFile.link;

    // Descargar video
    const fileName = `pexels_${Date.now()}.mp4`;
    const filePath = path.join(DIRECTORIES.downloads, fileName);

    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    const writer = require('fs').createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stats = await fs.stat(filePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    if (stats.size > 25 * 1024 * 1024) {
      await fs.unlink(filePath);
      return interaction.editReply('⚠️ El video supera los 25MB.');
    }

    const embed = new EmbedBuilder()
      .setTitle('📹 Video de Pexels')
      .setDescription(`🔍 Búsqueda: ${busqueda}\n📦 Tamaño: ${sizeMB} MB`)
      .setColor(0xff6699);

    await interaction.editReply({ 
      embeds: [embed], 
      files: [{ attachment: filePath, name: fileName }]
    });

    setTimeout(async () => {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error eliminando video:', error);
      }
    }, 5000);

  } catch (error) {
    console.error('Error video Pexels:', error);
    await interaction.editReply('❌ Error al procesar el video.');
  }
}

// 🎠 Carrusel de imágenes reutilizable
async function createImageCarousel(interaction, imagenes, busqueda, tipo) {
  let index = 0;

  const createEmbed = () => new EmbedBuilder()
    .setTitle(`🖼️ Imagen ${index + 1}/${imagenes.length}`)
    .setDescription(`🔍 Búsqueda: **${busqueda}**`)
    .setImage(imagenes[index])
    .setColor(tipo === 'pexels' ? 0x05A081 : 0xff0066)
    .setFooter({ text: `Fuente: ${tipo === 'pexels' ? 'Pexels' : 'Google'} • Usa los botones para navegar` });

  const createButtons = () => new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('img_prev')
        .setLabel('⏪ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(imagenes.length === 1),
      new ButtonBuilder()
        .setCustomId('img_next')
        .setLabel('⏩ Siguiente')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(imagenes.length === 1),
      new ButtonBuilder()
        .setCustomId('img_save')
        .setLabel('📩 Guardar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('img_delete')
        .setLabel('🗑️ Eliminar')
        .setStyle(ButtonStyle.Danger)
    );

  const message = await interaction.editReply({
    embeds: [createEmbed()],
    components: [createButtons()]
  });

  const collector = message.createMessageComponentCollector({ 
    filter: i => i.user.id === interaction.user.id,
    time: 300000 
  });

  collector.on('collect', async i => {
    try {
      if (i.customId === 'img_prev') {
        index = (index - 1 + imagenes.length) % imagenes.length;
        await i.update({ embeds: [createEmbed()], components: [createButtons()] });
      } else if (i.customId === 'img_next') {
        index = (index + 1) % imagenes.length;
        await i.update({ embeds: [createEmbed()], components: [createButtons()] });
      } else if (i.customId === 'img_save') {
        try {
          await i.user.send(`📷 Imagen guardada:\n${imagenes[index]}`);
          await i.reply({ content: '✅ Imagen enviada a tu MD', ephemeral: true });
        } catch {
          await i.reply({ content: '🚫 No pude enviarte MD. Activa tus mensajes directos.', ephemeral: true });
        }
      } else if (i.customId === 'img_delete') {
        await message.delete();
      }
    } catch (error) {
      console.error('Error en botón imagen:', error);
    }
  });

  collector.on('end', () => {
    message.edit({ components: [] }).catch(() => {});
  });
}

// 🏓 Comando Ping
async function handlePingCommand(interaction) {
  const inicio = Date.now();
  await interaction.deferReply();

  const latencia = Date.now() - inicio;
  const apiLatency = Math.round(client.ws.ping);

  const embed = new EmbedBuilder()
    .setTitle('🏓 Pong!')
    .setDescription('Estado de conexión del bot')
    .setColor(0x33ccff)
    .addFields(
      { name: '📡 Latencia API', value: `${apiLatency}ms`, inline: true },
      { name: '🔗 Tiempo respuesta', value: `${latencia}ms`, inline: true },
      { name: '⏱️ Uptime', value: `${Math.floor(client.uptime / 60000)} minutos`, inline: true }
    )
    .setFooter({ text: 'Bot operativo' });

  await interaction.editReply({ embeds: [embed] });
}

// 🖥️ Comando Sistema
async function handleSystemCommand(interaction) {
  await interaction.deferReply();

  const used = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const embed = new EmbedBuilder()
    .setTitle('💀 Información del Sistema')
    .setDescription('Diagnóstico completo del host y bot')
    .setColor(0x8B0000)
    .addFields(
      { 
        name: '🧠 Memoria RAM', 
        value: `**Uso:** ${((usedMem / totalMem) * 100).toFixed(2)}%\n**Usado:** ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB\n**Total:** ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`, 
        inline: false 
      },
      { 
        name: '💾 Memoria Bot', 
        value: `**Heap:** ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB\n**Total:** ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`, 
        inline: true 
      },
      { 
        name: '🖥️ Sistema', 
        value: `**OS:** ${os.type()}\n**Plataforma:** ${os.platform()}\n**Arquitectura:** ${os.arch()}`, 
        inline: true 
      },
      { 
        name: '⏱️ Uptime', 
        value: `**Sistema:** ${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m\n**Bot:** ${Math.floor(client.uptime / 60000)} minutos`, 
        inline: false 
      },
      { 
        name: '🌐 Estadísticas', 
        value: `**Servidores:** ${client.guilds.cache.size}\n**Usuarios:** ${client.users.cache.size}\n**Canales:** ${client.channels.cache.size}`, 
        inline: false 
      }
    )
    .setFooter({ text: `Node.js ${process.version}` });

  await interaction.editReply({ embeds: [embed] });
}

// 📨 Comando Enviar Mensaje
async function handleSendMessageCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const contenido = interaction.options.getString('contenido');

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_send')
        .setLabel('✅ Confirmar envío')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('cancel_send')
        .setLabel('❌ Cancelar')
        .setStyle(ButtonStyle.Danger)
    );

  const previewEmbed = new EmbedBuilder()
    .setTitle('⚠️ Confirmación de envío')
    .setDescription(`**Contenido:**\n${contenido}`)
    .setColor(0xffa500)
    .setFooter({ text: 'Este mensaje será enviado en tu nombre' });

  await interaction.editReply({
    embeds: [previewEmbed],
    components: [row]
  });

  const filter = i => i.user.id === interaction.user.id && ['confirm_send', 'cancel_send'].includes(i.customId);
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 });

  collector.on('collect', async i => {
    if (i.customId === 'confirm_send') {
      try {
        const mensajeEnviado = await interaction.channel.send(contenido);

        // Log al canal de logs
        if (CONFIG.LOG_CHANNEL_ID) {
          const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
          if (logChannel) {
            const logEmbed = new EmbedBuilder()
              .setTitle('📨 Mensaje enviado registrado')
              .setColor(0x00cc99)
              .addFields(
                { name: '👤 Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: false },
                { name: '📍 Canal', value: `${interaction.channel.name} (${interaction.channel.id})`, inline: false },
                { name: '💬 Contenido', value: contenido.substring(0, 1000), inline: false },
                { name: '🕐 Timestamp', value: new Date().toLocaleString('es-ES'), inline: false }
              );

            const deleteRow = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId(`delete_msg_${mensajeEnviado.id}`)
                  .setLabel('🗑️ Eliminar mensaje')
                  .setStyle(ButtonStyle.Danger)
              );

            await logChannel.send({ embeds: [logEmbed], components: [deleteRow] });
          }
        }

        await i.update({ 
          embeds: [new EmbedBuilder()
            .setTitle('✅ Mensaje enviado')
            .setDescription('Tu mensaje ha sido publicado y registrado correctamente.')
            .setColor(0x00ff00)],
          components: [] 
        });
      } catch (error) {
        await i.update({ 
          content: '⚠️ No se pudo enviar el mensaje. Verifica los permisos del bot.', 
          embeds: [], 
          components: [] 
        });
      }
    } else {
      await i.update({ 
        embeds: [new EmbedBuilder()
          .setTitle('🚫 Envío cancelado')
          .setDescription('El mensaje no fue enviado.')
          .setColor(0xff0000)],
        components: [] 
      });
    }
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.editReply({ 
        content: '⏱️ Tiempo agotado. Envío cancelado.', 
        embeds: [], 
        components: [] 
      }).catch(() => {});
    }
  });
}

// 💡 Comando Consejo
async function handleAdviceCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.GEMINI_API_KEY) {
    return interaction.editReply('⚠️ IA no configurada.');
  }

  try {
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent('Dame un consejo útil, motivador y original para hoy. Máximo 500 caracteres.');
    const consejo = result.response.text();

    const embed = new EmbedBuilder()
      .setTitle('💡 Consejo del día')
      .setDescription(consejo.substring(0, 4000))
      .setColor(0xffcc00)
      .setFooter({ text: 'Consejo generado por IA' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('save_advice')
          .setLabel('📩 Guardar')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('regenerate_advice')
          .setLabel('🔁 Nuevo consejo')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('delete_advice')
          .setLabel('🗑️ Eliminar')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    console.error('Error generando consejo:', error);
    await interaction.editReply('⚠️ No se pudo generar el consejo.');
  }
}

// 🔗 Comando Revisar Enlace
async function handleCheckLinkCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.VT_API_KEY && !CONFIG.LINKPREVIEW_API_KEY) {
    return interaction.editReply('⚠️ Servicios de análisis no configurados.');
  }

  const url = interaction.options.getString('url');
  let vtData = null;
  let previewData = null;

  try {
    // VirusTotal
    if (CONFIG.VT_API_KEY) {
      try {
        const vtSubmit = await axios.post(
          'https://www.virustotal.com/api/v3/urls',
          `url=${encodeURIComponent(url)}`,
          { headers: { 'x-apikey': CONFIG.VT_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        await new Promise(resolve => setTimeout(resolve, 3000)); // Esperar análisis

        const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
        const vtResponse = await axios.get(
          `https://www.virustotal.com/api/v3/urls/${urlId}`,
          { headers: { 'x-apikey': CONFIG.VT_API_KEY } }
        );

        vtData = vtResponse.data.data.attributes.last_analysis_stats;
      } catch (error) {
        console.error('Error VT:', error.message);
      }
    }

    // LinkPreview
    if (CONFIG.LINKPREVIEW_API_KEY) {
      try {
        const previewResponse = await axios.get(
          `https://api.linkpreview.net/?key=${CONFIG.LINKPREVIEW_API_KEY}&q=${encodeURIComponent(url)}`
        );
        previewData = previewResponse.data;
      } catch (error) {
        console.error('Error LinkPreview:', error.message);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('🔗 Análisis de enlace')
      .setDescription(`**URL analizada:**\n\`${url}\``)
      .setColor(vtData && vtData.malicious > 0 ? 0xff0000 : 0x00cc99);

    if (vtData) {
      embed.addFields({
        name: '🔒 Análisis de seguridad (VirusTotal)',
        value: `🔴 Maliciosos: ${vtData.malicious || 0}\n🟡 Sospechosos: ${vtData.suspicious || 0}\n🟢 Seguros: ${vtData.harmless || 0}\n⚪ Sin detectar: ${vtData.undetected || 0}`,
        inline: false
      });
    }

    if (previewData) {
      embed.addFields(
        { name: '📄 Título', value: previewData.title || 'Sin título', inline: false },
        { name: '📝 Descripción', value: (previewData.description || 'Sin descripción').substring(0, 300), inline: false }
      );

      if (previewData.image) {
        embed.setThumbnail(previewData.image);
      }
    }

    embed.setFooter({ text: 'Análisis completado' });
    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Error analizando enlace:', error);
    await interaction.editReply('❌ Error al analizar el enlace. Verifica que sea válido.');
  }
}

// 🔐 Comando Descifrar
async function handleDecipherCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const clave = interaction.options.getString('clave');
  const usuario = interaction.user;

  if (clave.trim() === CONFIG.SECRET_PASSWORD) {
    // Contraseña correcta
    const successEmbed = new EmbedBuilder()
      .setTitle('🔓 ¡Contraseña correcta!')
      .setDescription(`¡Felicidades ${usuario}! Has descifrado la contraseña secreta.`)
      .setColor(0x00ff99)
      .setFooter({ text: 'Acceso concedido' });

    await interaction.editReply({ embeds: [successEmbed] });

    // Notificar públicamente
    const publicEmbed = new EmbedBuilder()
      .setTitle('🎉 Contraseña descifrada')
      .setDescription(`${usuario} ha logrado descifrar la contraseña secreta del bot.`)
      .setColor(0x00ff99);

    await interaction.channel.send({ embeds: [publicEmbed] });

    // Log
    if (CONFIG.LOG_CHANNEL_ID) {
      const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
      if (logChannel) {
        await logChannel.send(`✅ ${usuario.tag} descifró la contraseña correctamente.`);
      }
    }
  } else {
    // Contraseña incorrecta
    const failEmbed = new EmbedBuilder()
      .setTitle('❌ Contraseña incorrecta')
      .setDescription('Intenta nuevamente. La contraseña sigue oculta...')
      .setColor(0xff0000);

    await interaction.editReply({ embeds: [failEmbed] });

    // Log de intento fallido
    if (CONFIG.LOG_CHANNEL_ID) {
      const logChannel = client.channels.cache.get(CONFIG.LOG_CHANNEL_ID);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('🚨 Intento de contraseña fallido')
          .addFields(
            { name: 'Usuario', value: `${usuario.tag} (${usuario.id})` },
            { name: 'Intento', value: `\`${clave}\`` }
          )
          .setColor(0xff3333);
        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  }
}

// 📜 Comando Scripter IA
async function handleScripterCommand(interaction) {
  await interaction.deferReply();

  if (!CONFIG.GEMINI_API_KEY) {
    return interaction.editReply('⚠️ IA no configurada.');
  }

  const idea = interaction.options.getString('idea');
  const codigo = interaction.options.getString('codigo');
  const serverId = interaction.guildId;

  // Sistema de verificación por servidor
  const serversFile = path.join(DIRECTORIES.data, 'servers.json');
  const codesFile = path.join(DIRECTORIES.data, 'codes.txt');

  let servers = {};
  let codes = [];

  try {
    const serversData = await fs.readFile(serversFile, 'utf-8');
    servers = JSON.parse(serversData);
  } catch (error) {
    // Archivo no existe, crear vacío
  }

  try {
    const codesData = await fs.readFile(codesFile, 'utf-8');
    codes = codesData.split('\n').filter(c => c.trim());
  } catch (error) {
    // Archivo no existe
  }

  // Verificar acceso
  if (!servers[serverId]) {
    if (!codigo) {
      return interaction.editReply('🔐 Este servidor no está verificado. Proporciona un código de verificación válido.');
    }

    if (!codes.includes(codigo)) {
      return interaction.editReply('❌ Código de verificación inválido o ya usado.');
    }

    // Verificar servidor
    servers[serverId] = {
      verified_at: Date.now(),
      code: codigo
    };

    await fs.writeFile(serversFile, JSON.stringify(servers, null, 2));

    // Remover código usado
    codes = codes.filter(c => c !== codigo);
    await fs.writeFile(codesFile, codes.join('\n'));

    await interaction.followUp('✅ Servidor verificado exitosamente. Generando script...');
  }

  try {
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Eres un experto en scripting de Roblox Lua. Genera un script funcional y bien comentado para: ${idea}. Incluye explicaciones breves en los comentarios.`;

    const result = await model.generateContent(prompt);
    const script = result.response.text();

    const chunks = script.match(/[\s\S]{1,4000}/g) || [script];

    for (let i = 0; i < chunks.length; i++) {
      const embed = new EmbedBuilder()
        .setTitle(i === 0 ? '📜 Script de Roblox' : `📜 Script (Parte ${i + 1})`)
        .setDescription(`\`\`\`lua\n${chunks[i]}\n\`\`\``)
        .setColor(0x00ff99)
        .setFooter({ text: `Generado para: ${idea}` });

      if (i === 0) {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('save_script')
              .setLabel('📩 Enviar a MD')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('regenerate_script')
              .setLabel('🔁 Regenerar')
              .setStyle(ButtonStyle.Primary)
          );

        await interaction.editReply({ embeds: [embed], components: [row] });
      } else {
        await interaction.followUp({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Error generando script:', error);
    await interaction.editReply('⚠️ Error generando el script.');
  }
}

// 🔑 Comando Generar Código
async function handleGenerateCodeCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  // Verificar que sea el owner
  const ownerId = process.env.OWNER_ID;
  if (ownerId && interaction.user.id !== ownerId) {
    return interaction.editReply('🚫 Solo el propietario del bot puede generar códigos.');
  }

  const prefijo = interaction.options.getString('prefijo');
  const validPrefixes = ['script_', 'verify_', 'auth_', 'access_', 'key_'];

  if (!validPrefixes.some(p => prefijo.startsWith(p))) {
    return interaction.editReply('⚠️ El prefijo debe comenzar con: script_, verify_, auth_, access_, o key_');
  }

  const suffix = Math.random().toString(36).substring(2, 10);
  const newCode = `${prefijo}${suffix}`;

  const codesFile = path.join(DIRECTORIES.data, 'codes.txt');

  try {
    await fs.appendFile(codesFile, `${newCode}\n`);

    const embed = new EmbedBuilder()
      .setTitle('🔑 Código generado')
      .setDescription(`\`\`\`${newCode}\`\`\``)
      .setColor(0x00ff00)
      .setFooter({ text: 'Este código puede usarse una sola vez' });

    await interaction.editReply({ embeds: [embed] });
    await logToFile(`Código generado: ${newCode} por ${interaction.user.tag}`);
  } catch (error) {
    console.error('Error guardando código:', error);
    await interaction.editReply('❌ Error al generar el código.');
  }
}

// ✅ Comando Verificar
async function handleVerifyCommand(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const missing = [];
  const configured = [];

  const checks = {
    'DISCORD_TOKEN': CONFIG.TOKEN,
    'CLIENT_ID': CONFIG.CLIENT_ID,
    'GEMINI_API_KEY': CONFIG.GEMINI_API_KEY,
    'GOOGLE_API_KEY': CONFIG.GOOGLE_API_KEY,
    'GOOGLE_CX_ID': CONFIG.GOOGLE_CX_ID,
    'PEXELS_API_KEY': CONFIG.PEXELS_API_KEY,
    'VT_API_KEY': CONFIG.VT_API_KEY,
    'LINKPREVIEW_API_KEY': CONFIG.LINKPREVIEW_API_KEY
  };

  for (const [key, value] of Object.entries(checks)) {
    if (!value || value === 'undefined') {
      missing.push(`🔴 \`${key}\``);
    } else {
      configured.push(`🟢 \`${key}\``);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('✅ Verificación de entorno')
    .setColor(missing.length === 0 ? 0x00ff00 : 0xffa500);

  if (configured.length > 0) {
    embed.addFields({ 
      name: '✅ Configurado', 
      value: configured.join('\n'), 
      inline: false 
    });
  }

  if (missing.length > 0) {
    embed.addFields({ 
      name: '❌ Faltante', 
      value: missing.join('\n') + '\n\n**Algunas funciones estarán limitadas.**', 
      inline: false 
    });
  } else {
    embed.setDescription('🎉 Todas las configuraciones están completas. El bot está totalmente funcional.');
  }

  embed.addFields(
    { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
    { name: '👥 Usuarios', value: `${client.users.cache.size}`, inline: true },
    { name: '⏱️ Uptime', value: `${Math.floor(client.uptime / 60000)}m`, inline: true }
  );

  await interaction.editReply({ embeds: [embed] });
}

// 📚 Comando Ayuda
async function handleHelpCommand(interaction) {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setTitle('📚 Comandos del Bot')
    .setDescription('Lista completa de comandos disponibles')
    .setColor(0x3498db)
    .addFields(
      { 
        name: '🧠 Inteligencia Artificial', 
        value: '`/ia` - Genera respuestas inteligentes\n`/consejo` - Recibe consejos útiles\n`/scripter-ia` - Genera scripts de Roblox', 
        inline: false 
      },
      { 
        name: '📥 Descargas', 
        value: '`/descargar` - Descarga de YouTube\n`/info` - Vista previa antes de descargar', 
        inline: false 
      },
      { 
        name: '🖼️ Imágenes y Videos', 
        value: '`/imagen` - Busca imágenes en Google\n`/imagenes-public` - Imágenes de Pexels\n`/videos-public` - Videos de Pexels', 
        inline: false 
      },
      { 
        name: '🔗 Utilidades', 
        value: '`/ping` - Verifica latencia\n`/sistema` - Info del sistema\n`/revisar-enlace` - Analiza URLs\n`/descifrar` - Contraseña secreta', 
        inline: false 
      },
      { 
        name: '📨 Administración', 
        value: '`/enviar-mensaje` - Envía mensajes\n`/verificar` - Verifica configuración\n`/generar-codigo` - Genera códigos (owner)', 
        inline: false 
      }
    )
    .setFooter({ text: 'Usa los comandos con / para comenzar' });

  await interaction.editReply({ embeds: [embed] });
}

// 🎯 Manejador de botones
async function handleButtonInteraction(interaction) {
  const customId = interaction.customId;

  try {
    // Botones de IA
    if (customId === 'save_ai') {
      const embed = interaction.message.embeds[0];
      try {
        await interaction.user.send(`🧠 **Respuesta de IA guardada:**\n\n${embed.description}`);
        await interaction.reply({ content: '✅ Respuesta enviada a tu MD', ephemeral: true });
      } catch {
        await interaction.reply({ content: '🚫 No pude enviarte MD', ephemeral: true });
      }
    } else if (customId === 'delete_ai' || customId === 'delete_advice' || customId === 'img_delete') {
      await interaction.message.delete();
    } else if (customId === 'regenerate_ai') {
      await interaction.deferReply();
      // Regenerar respuesta IA
      const originalEmbed = interaction.message.embeds[0];
      await interaction.followUp('🔄 Regenerando respuesta...');
    } else if (customId.startsWith('download_')) {
      // Botón de descarga desde /info
      const [, formato, urlBase64] = customId.split('_');
      const url = Buffer.from(urlBase64, 'base64').toString();

      // Simular comando de descarga
      interaction.options = {
        getString: (key) => key === 'formato' ? formato : url
      };
      await handleDownloadCommand(interaction);
    } else if (customId.startsWith('delete_msg_')) {
      const messageId = customId.split('_')[2];
      try {
        const channel = interaction.channel;
        const message = await channel.messages.fetch(messageId);
        await message.delete();
        await interaction.reply({ content: '✅ Mensaje eliminado', ephemeral: true });
      } catch {
        await interaction.reply({ content: '⚠️ No se pudo eliminar el mensaje', ephemeral: true });
      }
    } else if (customId === 'save_advice' || customId === 'save_script') {
      const embed = interaction.message.embeds[0];
      try {
        await interaction.user.send(`**Contenido guardado:**\n\n${embed.description}`);
        await interaction.reply({ content: '✅ Enviado a tu MD', ephemeral: true });
      } catch {
        await interaction.reply({ content: '🚫 No pude enviarte MD', ephemeral: true });
      }
    } else if (customId === 'regenerate_advice') {
      // Regenerar consejo
      await handleAdviceCommand(interaction);
    } else if (customId === 'regenerate_script') {
      await interaction.reply({ content: '🔄 Usa `/scripter-ia` nuevamente para regenerar', ephemeral: true });
    }
  } catch (error) {
    console.error('Error en botón:', error);
    await logToFile(`Error en botón ${customId}: ${error.message}`);
  }
}

// 🚨 Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  logToFile(`Unhandled rejection: ${error.message}`);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  logToFile(`Uncaught exception: ${error.message}`);
});

// 🚀 Iniciar bot
async function startBot() {
  if (!CONFIG.TOKEN) {
    console.error('❌ DISCORD_TOKEN no configurado en .env');
    console.error('Por favor configura tu token en el archivo .env');
    process.exit(1);
  }

  try {
    await client.login(CONFIG.TOKEN);
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    console.error('Verifica que tu DISCORD_TOKEN sea válido');
    process.exit(1);
  }
}

startBot();