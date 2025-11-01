#!/bin/bash

# Script de monitoramento do BoraEntregar
# Verifica status dos serviços e envia alertas se necessário

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Banner
echo "═══════════════════════════════════════"
log "Monitor BoraEntregar"
echo "═══════════════════════════════════════"
echo ""

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose não encontrado!"
    exit 1
fi

# Status geral
info "Status dos Containers:"
docker-compose ps
echo ""

# Verificar cada serviço
SERVICES=("backend-main" "backend-dev" "nginx")
ALL_HEALTHY=true

for SERVICE in "${SERVICES[@]}"; do
    info "Verificando $SERVICE..."

    # Verificar se está rodando
    if docker-compose ps | grep -q "$SERVICE.*Up"; then
        echo -e "  ${GREEN}✓${NC} Container rodando"

        # Verificar health check (se disponível)
        if docker inspect boraentregar-$SERVICE &> /dev/null; then
            HEALTH=$(docker inspect --format='{{.State.Health.Status}}' boraentregar-$SERVICE 2>/dev/null || echo "no-healthcheck")

            if [ "$HEALTH" = "healthy" ]; then
                echo -e "  ${GREEN}✓${NC} Health check: OK"
            elif [ "$HEALTH" = "no-healthcheck" ]; then
                echo -e "  ${YELLOW}⚠${NC} Health check: não configurado"
            else
                echo -e "  ${RED}✗${NC} Health check: $HEALTH"
                ALL_HEALTHY=false
            fi
        fi

        # Verificar logs de erro recentes
        ERROR_COUNT=$(docker-compose logs --tail=100 $SERVICE 2>&1 | grep -iE "error|fatal|exception" | wc -l)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            warn "Encontrados $ERROR_COUNT erros nos últimos 100 logs"
        fi

    else
        error "Container não está rodando!"
        ALL_HEALTHY=false
    fi
    echo ""
done

# Verificar endpoints HTTP
info "Verificando Endpoints HTTP:"

# Backend Main
if curl -sf http://localhost:5001/health > /dev/null; then
    echo -e "  ${GREEN}✓${NC} Backend Main (5001): OK"
else
    error "Backend Main (5001): FALHOU"
    ALL_HEALTHY=false
fi

# Backend Dev
if curl -sf http://localhost:5002/health > /dev/null; then
    echo -e "  ${GREEN}✓${NC} Backend Dev (5002): OK"
else
    error "Backend Dev (5002): FALHOU"
    ALL_HEALTHY=false
fi

# Nginx (se estiver rodando)
if docker-compose ps | grep -q "nginx.*Up"; then
    if curl -sf http://localhost:80 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Nginx (80): OK"
    else
        warn "Nginx (80): sem resposta (pode ser normal se não configurado)"
    fi
fi

echo ""

# Verificar uso de recursos
info "Uso de Recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep boraentregar || true
echo ""

# Verificar espaço em disco
info "Espaço em Disco:"
df -h / | tail -1 | awk '{print "  Usado: "$3" / "$2" ("$5")"}'
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    warn "Uso de disco acima de 80%!"
fi

# Docker disk usage
DOCKER_SIZE=$(docker system df -v 2>/dev/null | grep "Total" | awk '{print $4}' || echo "N/A")
info "Uso Docker: $DOCKER_SIZE"
echo ""

# Verificar uptime dos containers
info "Uptime dos Containers:"
for SERVICE in "${SERVICES[@]}"; do
    if docker-compose ps | grep -q "$SERVICE.*Up"; then
        UPTIME=$(docker inspect --format='{{.State.StartedAt}}' boraentregar-$SERVICE 2>/dev/null || echo "N/A")
        if [ "$UPTIME" != "N/A" ]; then
            echo "  $SERVICE: iniciado em $UPTIME"
        fi
    fi
done
echo ""

# Verificar logs recentes de erro
info "Erros Recentes (últimas 24h):"
ERROR_LOGS=$(docker-compose logs --since 24h 2>&1 | grep -iE "error|fatal|exception" | tail -5)
if [ -z "$ERROR_LOGS" ]; then
    echo -e "  ${GREEN}✓${NC} Nenhum erro encontrado"
else
    echo "$ERROR_LOGS" | while read -r line; do
        echo -e "  ${RED}•${NC} $line"
    done
fi
echo ""

# Resumo final
echo "═══════════════════════════════════════"
if [ "$ALL_HEALTHY" = true ]; then
    log "Status Geral: ${GREEN}TODOS OS SERVIÇOS OK${NC}"
else
    error "Status Geral: ${RED}PROBLEMAS DETECTADOS${NC}"
    echo ""
    echo "Execute os seguintes comandos para investigar:"
    echo "  docker-compose logs -f"
    echo "  docker-compose ps"
    echo "  docker stats"
fi
echo "═══════════════════════════════════════"

# Exit code baseado no status
if [ "$ALL_HEALTHY" = true ]; then
    exit 0
else
    exit 1
fi
