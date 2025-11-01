#!/bin/bash

# Script de deploy para VPS Hetzner
# Uso: ./deploy.sh [main|dev|both]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir mensagens
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se .env existe
if [ ! -f .env ]; then
    log_error "Arquivo .env não encontrado!"
    log_info "Copie o arquivo .env.example e configure as variáveis:"
    log_info "cp .env.example .env"
    exit 1
fi

# Carregar variáveis de ambiente
source .env

# Determinar qual ambiente fazer deploy
ENVIRONMENT=${1:-both}

if [ "$ENVIRONMENT" != "main" ] && [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "both" ]; then
    log_error "Ambiente inválido. Use: main, dev ou both"
    exit 1
fi

log_info "Iniciando deploy para ambiente: $ENVIRONMENT"

# Função para fazer deploy
deploy_environment() {
    local env=$1
    log_info "Fazendo deploy do backend-$env..."

    # Parar container se estiver rodando
    docker-compose stop backend-$env 2>/dev/null || true

    # Remover container antigo
    docker-compose rm -f backend-$env 2>/dev/null || true

    # Build da nova imagem
    log_info "Building imagem para backend-$env..."
    docker-compose build --no-cache backend-$env

    # Iniciar novo container
    log_info "Iniciando backend-$env..."
    docker-compose up -d backend-$env

    # Aguardar health check
    log_info "Aguardando health check do backend-$env..."
    sleep 10

    # Verificar se está rodando
    if docker-compose ps | grep -q "backend-$env.*Up"; then
        log_info "✓ Backend-$env deployado com sucesso!"
    else
        log_error "✗ Falha ao deployar backend-$env"
        docker-compose logs backend-$env
        exit 1
    fi
}

# Deploy do Nginx (se necessário)
deploy_nginx() {
    log_info "Verificando Nginx..."
    if ! docker-compose ps | grep -q "nginx.*Up"; then
        log_info "Iniciando Nginx..."
        docker-compose up -d nginx
    else
        log_info "Recarregando configuração do Nginx..."
        docker-compose exec nginx nginx -s reload
    fi
}

# Executar deploy conforme ambiente escolhido
if [ "$ENVIRONMENT" = "main" ]; then
    deploy_environment "main"
elif [ "$ENVIRONMENT" = "dev" ]; then
    deploy_environment "dev"
else
    deploy_environment "main"
    deploy_environment "dev"
fi

# Deploy do Nginx
deploy_nginx

# Limpar imagens não utilizadas
log_info "Limpando imagens antigas..."
docker image prune -f

log_info "═══════════════════════════════════════"
log_info "Deploy concluído com sucesso!"
log_info "═══════════════════════════════════════"

# Exibir status dos containers
log_info "Status dos containers:"
docker-compose ps

# Exibir logs recentes
log_info ""
log_info "Logs recentes:"
if [ "$ENVIRONMENT" = "main" ]; then
    docker-compose logs --tail=20 backend-main
elif [ "$ENVIRONMENT" = "dev" ]; then
    docker-compose logs --tail=20 backend-dev
else
    docker-compose logs --tail=20 backend-main backend-dev
fi
