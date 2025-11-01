# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo dev dependencies para o build)
RUN npm install

# Copiar código fonte
COPY src ./src

# Build do TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar apenas dependências de produção
COPY package*.json ./
RUN npm install --omit=dev && \
    npm cache clean --force

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar
CMD ["node", "dist/server.js"]
