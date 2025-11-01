#!/bin/bash

# Script de configuração inicial do VPS Hetzner
# Execute este script no servidor VPS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "═══════════════════════════════════════"
log_info "Setup VPS Hetzner - BoraEntregar"
log_info "═══════════════════════════════════════"

# Atualizar sistema
log_info "Atualizando sistema..."
apt-get update
apt-get upgrade -y

# Instalar dependências básicas
log_info "Instalando dependências básicas..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    vim \
    htop \
    ufw

# Instalar Docker
log_info "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Adicionar usuário ao grupo docker
    usermod -aG docker $USER

    log_info "✓ Docker instalado com sucesso!"
else
    log_info "✓ Docker já está instalado"
fi

# Instalar Docker Compose
log_info "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    log_info "✓ Docker Compose instalado com sucesso!"
else
    log_info "✓ Docker Compose já está instalado"
fi

# Configurar firewall
log_info "Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

log_info "✓ Firewall configurado!"

# Criar diretório do projeto
log_info "Criando diretório do projeto..."
mkdir -p /opt/boraentregar
cd /opt/boraentregar

log_info "═══════════════════════════════════════"
log_info "Setup concluído!"
log_info "═══════════════════════════════════════"
log_info ""
log_info "Próximos passos:"
log_info "1. Clone o repositório em /opt/boraentregar"
log_info "2. Copie o arquivo .env.example para .env e configure"
log_info "3. Execute ./deploy.sh para iniciar os containers"
log_info ""
log_info "Comandos úteis:"
log_info "  - Ver logs: docker-compose logs -f"
log_info "  - Status: docker-compose ps"
log_info "  - Parar: docker-compose down"
log_info "  - Reiniciar: docker-compose restart"
