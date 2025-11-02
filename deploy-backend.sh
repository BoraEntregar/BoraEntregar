#!/bin/bash

# Script de deploy do backend BoraEntregar com Docker Compose
# Este script pode ser executado diretamente na VPS ou via GitHub Actions

set -e  # Parar em caso de erro

echo "🚀 BoraEntregar - Deploy Backend (Docker)"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJECT_DIR="$HOME/BoraEntregar"

# Verificar se está no diretório correto
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Diretório do projeto não encontrado: $PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Funções para printar com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Detectar branch atual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Determinar qual serviço fazer deploy baseado na branch
if [ "$CURRENT_BRANCH" == "main" ]; then
    SERVICE="backend-main"
    PORT="5001"
    ENV="PRODUÇÃO"
elif [ "$CURRENT_BRANCH" == "dev" ]; then
    SERVICE="backend-dev"
    PORT="5002"
    ENV="DESENVOLVIMENTO"
else
    print_error "Branch '$CURRENT_BRANCH' não suportada para deploy"
    print_info "Use 'main' para produção ou 'dev' para desenvolvimento"
    exit 1
fi

print_header "Deploy do Ambiente: $ENV"
print_info "Branch: $CURRENT_BRANCH"
print_info "Serviço: $SERVICE"
print_info "Porta: $PORT"
echo ""

# 1. Backup do .env
print_info "Fazendo backup do arquivo .env..."
if [ -f ".env" ]; then
    cp .env .env.backup
    print_success "Backup do .env criado"
else
    print_error "Arquivo .env não encontrado!"
    print_info "Certifique-se de criar o arquivo .env na raiz do projeto"
    exit 1
fi

# 2. Atualizar código
print_info "Atualizando código do repositório..."
git fetch --all
git pull origin "$CURRENT_BRANCH"
print_success "Código atualizado (branch: $CURRENT_BRANCH)"

# 3. Restaurar .env
if [ -f ".env.backup" ]; then
    mv .env.backup .env
    print_success ".env restaurado"
fi

# 4. Parar container antigo
print_info "Parando container $SERVICE..."
docker-compose stop "$SERVICE" 2>/dev/null || true
docker-compose rm -f "$SERVICE" 2>/dev/null || true
print_success "Container antigo removido"

# 5. Rebuild do container
print_info "Rebuilding container $SERVICE..."
docker-compose build --no-cache "$SERVICE"
print_success "Container reconstruído"

# 6. Iniciar container
print_info "Iniciando container $SERVICE..."
docker-compose up -d "$SERVICE"
print_success "Container iniciado"

# 7. Aguardar inicialização
print_info "Aguardando container inicializar..."
sleep 10

# 8. Verificar se container está rodando
if docker-compose ps | grep -q "$SERVICE.*Up"; then
    print_success "Container $SERVICE está rodando!"
else
    print_error "Container não iniciou corretamente"
    echo ""
    print_info "Logs do container:"
    docker-compose logs --tail=50 "$SERVICE"
    exit 1
fi

# 9. Health check
print_info "Verificando health da API..."
sleep 5

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/health" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    print_success "API respondendo corretamente! (HTTP $HEALTH_CHECK)"
else
    echo -e "${YELLOW}⚠️  Health check retornou: HTTP $HEALTH_CHECK${NC}"
    print_info "Verificando logs..."
    docker-compose logs --tail=30 "$SERVICE"
fi

# 10. Limpar imagens antigas
print_info "Limpando imagens antigas..."
docker image prune -f 2>/dev/null || true
print_success "Limpeza concluída"

# Status final
echo ""
print_header "Deploy Concluído!"
echo -e "${GREEN}🌍 Ambiente: $ENV${NC}"
echo -e "${GREEN}📦 Container: $SERVICE${NC}"
echo -e "${GREEN}🔗 Porta: $PORT${NC}"
echo ""

# Mostrar status dos containers
print_info "Status dos containers:"
docker-compose ps

# Últimos logs
echo ""
print_info "Últimos logs (20 linhas):"
docker-compose logs --tail=20 "$SERVICE"

echo ""
print_success "Deploy finalizado! 🎉"
