# ============================================
# STAGE 1: Builder
# ============================================
FROM node:18-alpine AS builder

LABEL maintainer="Discord Bot Team"
LABEL version="2.0.0"

# Instalar dependencias de compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    ca-certificates

WORKDIR /app

# Copiar package.json primero para aprovechar cache
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# STAGE 2: Runtime
# ============================================
FROM node:18-alpine

# Variables de entorno
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn \
    NODE_OPTIONS="--max-old-space-size=512" \
    TZ=America/Lima

# Instalar dependencias runtime
RUN apk add --no-cache \
    ffmpeg \
    ffmpeg-libs \
    ca-certificates \
    tzdata \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# Configurar zona horaria
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Crear usuario no-root
RUN addgroup -g 1000 botuser && \
    adduser -D -u 1000 -G botuser botuser

WORKDIR /app

# Copiar node_modules del builder
COPY --from=builder --chown=botuser:botuser /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=botuser:botuser package*.json ./
COPY --chown=botuser:botuser index.js ./
COPY --chown=botuser:botuser .env.example ./

# Crear directorios con permisos
RUN mkdir -p downloads data logs && \
    chown -R botuser:botuser /app && \
    chmod -R 755 /app

# Cambiar a usuario no-root
USER botuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Puerto (para futuras expansiones)
EXPOSE 3000

# Usar tini como init
ENTRYPOINT ["/sbin/tini", "--"]

# Comando de inicio
CMD ["node", "index.js"]