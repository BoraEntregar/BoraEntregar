# Comandos Úteis - BoraEntregar

Referência rápida de comandos para gerenciar o deploy.

## 🚀 Deploy

### Deploy Completo
```bash
# Ambos os ambientes
./deploy.sh both

# Apenas produção
./deploy.sh main

# Apenas desenvolvimento
./deploy.sh dev
```

### Deploy Manual
```bash
# Build específico
docker-compose build --no-cache backend-main
docker-compose up -d backend-main

# Rebuild tudo
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoramento

### Status dos Containers
```bash
# Ver todos os containers
docker-compose ps

# Ver apenas rodando
docker ps

# Ver detalhes de um container
docker inspect boraentregar-backend-main
```

### Logs
```bash
# Logs em tempo real (todos)
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend-main
docker-compose logs -f backend-dev
docker-compose logs -f nginx

# Últimas 100 linhas
docker-compose logs --tail=100 backend-main

# Logs desde um tempo específico
docker-compose logs --since 30m backend-main
docker-compose logs --since 2024-01-01T10:00:00

# Logs do sistema
tail -f /var/log/syslog
journalctl -u docker -f
```

### Health Checks
```bash
# Via Docker
docker-compose ps
docker inspect --format='{{json .State.Health}}' boraentregar-backend-main

# Via HTTP
curl http://localhost:5001/health
curl http://localhost:5002/health

# Com cabeçalhos
curl -i http://localhost:5001/health

# Via domínio público
curl https://api.seu-dominio.com/health
curl https://api-dev.seu-dominio.com/health
```

### Recursos
```bash
# CPU, RAM, Network em tempo real
docker stats

# Uso de disco
docker system df
docker system df -v

# Disco geral
df -h
du -sh /var/lib/docker

# Processos
htop
top
```

## 🔄 Controle de Containers

### Iniciar/Parar
```bash
# Iniciar todos
docker-compose up -d

# Iniciar específico
docker-compose up -d backend-main

# Parar todos
docker-compose stop

# Parar específico
docker-compose stop backend-main

# Parar e remover
docker-compose down

# Parar, remover e limpar volumes
docker-compose down -v
```

### Reiniciar
```bash
# Reiniciar todos
docker-compose restart

# Reiniciar específico
docker-compose restart backend-main
docker-compose restart nginx

# Forçar recreação
docker-compose up -d --force-recreate backend-main
```

### Executar Comandos
```bash
# Shell interativo
docker-compose exec backend-main sh
docker-compose exec nginx sh

# Comando direto
docker-compose exec backend-main node --version
docker-compose exec backend-main npm list

# Como root
docker-compose exec -u root backend-main sh
```

## 🗄️ Banco de Dados

### Backup
```bash
# Backup completo (MongoDB Atlas)
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-main" \
  --out=/opt/backups/$(date +%Y%m%d)

# Backup de uma collection
mongodump --uri="..." --collection=routes --out=/opt/backups/routes

# Backup compactado
mongodump --uri="..." --gzip --archive=/opt/backups/backup.gz
```

### Restore
```bash
# Restore completo
mongorestore --uri="..." /opt/backups/20240101

# Restore de uma collection
mongorestore --uri="..." --collection=routes /opt/backups/routes

# Restore de arquivo compactado
mongorestore --uri="..." --gzip --archive=/opt/backups/backup.gz
```

### Consultas Diretas
```bash
# Via mongosh (se instalado)
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-main"

# Contar documentos
mongosh "..." --eval "db.routes.countDocuments()"

# Ver últimos registros
mongosh "..." --eval "db.routes.find().sort({_id:-1}).limit(5).pretty()"
```

## 🔧 Manutenção

### Limpeza
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não usadas
docker image prune -a -f

# Remover volumes não usados
docker volume prune -f

# Remover tudo não usado
docker system prune -a -f --volumes

# Limpar logs antigos
truncate -s 0 /var/lib/docker/containers/**/*-json.log
```

### Atualização
```bash
# Atualizar código
cd /opt/boraentregar
git fetch origin
git pull origin main    # ou dev

# Rebuild e restart
./deploy.sh main        # ou dev

# Atualizar dependências Node
docker-compose exec backend-main npm update
docker-compose restart backend-main
```

### Verificação
```bash
# Verificar configuração docker-compose
docker-compose config

# Verificar integridade das imagens
docker-compose images

# Verificar portas abertas
sudo netstat -tulpn | grep LISTEN
sudo lsof -i -P -n | grep LISTEN

# Verificar firewall
sudo ufw status verbose
```

## 🌐 Nginx

### Configuração
```bash
# Testar configuração
docker-compose exec nginx nginx -t

# Recarregar configuração (sem downtime)
docker-compose exec nginx nginx -s reload

# Ver configuração ativa
docker-compose exec nginx cat /etc/nginx/nginx.conf
docker-compose exec nginx cat /etc/nginx/conf.d/boraentregar.conf
```

### Logs
```bash
# Access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec nginx tail -f /var/log/nginx/backend-main-access.log

# Error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log
docker-compose exec nginx tail -f /var/log/nginx/backend-main-error.log

# Estatísticas de acesso
docker-compose exec nginx cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head
```

### SSL/HTTPS
```bash
# Verificar certificados
sudo certbot certificates

# Renovar certificados
sudo certbot renew

# Renovar forçado (teste)
sudo certbot renew --dry-run

# Após renovação, copiar para Nginx
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/*.pem /opt/boraentregar/nginx/ssl/
sudo chown -R 1000:1000 /opt/boraentregar/nginx/ssl/
docker-compose exec nginx nginx -s reload
```

## 🔍 Debug

### Conectividade
```bash
# Testar conexão entre containers
docker-compose exec backend-main ping backend-dev
docker-compose exec backend-main ping nginx

# Testar DNS
docker-compose exec backend-main nslookup google.com
docker-compose exec backend-main nslookup seu-cluster.mongodb.net

# Testar portas
docker-compose exec backend-main nc -zv localhost 5001
telnet localhost 5001
```

### Variáveis de Ambiente
```bash
# Ver todas as variáveis
docker-compose exec backend-main env

# Ver variável específica
docker-compose exec backend-main printenv MONGODB_URI_MAIN
docker-compose exec backend-main printenv NODE_ENV

# Ver configuração docker-compose com variáveis
docker-compose config
```

### Network
```bash
# Listar networks
docker network ls

# Inspecionar network
docker network inspect boraentregar-network-main

# Ver containers em uma network
docker network inspect boraentregar-network-main | grep -A 5 Containers

# Testar conexão HTTP interna
docker-compose exec nginx wget -qO- http://backend-main:5001/health
docker-compose exec backend-main wget -qO- http://backend-dev:5001/health
```

### Volumes
```bash
# Listar volumes
docker volume ls

# Inspecionar volume
docker volume inspect boraentregar_backend-uploads-main

# Ver conteúdo (cuidado!)
sudo ls -la /var/lib/docker/volumes/boraentregar_backend-uploads-main/_data

# Backup de volume
docker run --rm \
  -v boraentregar_backend-uploads-main:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/uploads-main-backup.tar.gz /data
```

## 📦 Git

### Atualização
```bash
# Ver status
git status
git log --oneline -5

# Atualizar
git fetch origin
git pull origin main

# Ver diferenças
git diff origin/main
git diff HEAD~1

# Trocar de branch
git checkout dev
git checkout main
```

### Rollback
```bash
# Ver histórico
git log --oneline

# Voltar para commit anterior (cuidado!)
git reset --hard abc123

# Ou criar branch de backup antes
git branch backup-$(date +%Y%m%d)
git reset --hard abc123
```

## 🔐 Segurança

### Firewall
```bash
# Status
sudo ufw status verbose

# Permitir porta
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Negar porta
sudo ufw deny 5001/tcp

# Permitir IP específico
sudo ufw allow from 203.0.113.0/24

# Recarregar
sudo ufw reload
```

### SSH
```bash
# Ver conexões ativas
who
w

# Ver histórico de login
last -a

# Ver tentativas falhadas
sudo grep "Failed password" /var/log/auth.log
```

### Updates
```bash
# Atualizar sistema
sudo apt update
sudo apt upgrade -y

# Atualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Atualizar Docker Compose
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 📈 Performance

### Otimização
```bash
# Limitar CPU/RAM de um container (no docker-compose.yml)
# deploy:
#   resources:
#     limits:
#       cpus: '1.0'
#       memory: 1G

# Ver uso por container
docker stats --no-stream

# Benchmark
ab -n 1000 -c 10 http://localhost:5001/health
```

### Cache
```bash
# Limpar cache do Docker
docker builder prune -a -f

# Limpar cache do sistema
sudo sync; echo 3 > /proc/sys/vm/drop_caches
```

## 🔄 CI/CD

### GitHub Actions (Local)
```bash
# Testar workflow localmente (com act)
act -j deploy

# Ver segredos configurados (GitHub)
gh secret list

# Adicionar segredo
gh secret set VPS_HOST --body "SEU_IP"
```

### Deploy Manual via SSH
```bash
# De forma remota
ssh user@vps "cd /opt/boraentregar && git pull origin main && ./deploy.sh main"

# Com log
ssh user@vps "cd /opt/boraentregar && git pull origin main && ./deploy.sh main" 2>&1 | tee deploy.log
```

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs --tail=200 backend-main

# Ver health check
docker inspect boraentregar-backend-main | grep -A 20 Health

# Tentar iniciar manualmente
docker-compose run --rm backend-main sh
```

### Porta em uso
```bash
# Ver o que está usando a porta
sudo lsof -i :5001
sudo netstat -tulpn | grep 5001

# Matar processo
sudo kill -9 PID

# Ou mudar porta no docker-compose.yml
```

### MongoDB não conecta
```bash
# Testar conexão
docker-compose exec backend-main sh
ping seu-cluster.mongodb.net

# Testar com node
docker-compose exec backend-main node -e "console.log(process.env.MONGODB_URI_MAIN)"

# Testar URI
mongosh "mongodb+srv://..." --eval "db.adminCommand('ping')"
```

### CORS Error
```bash
# Ver configuração CORS no Nginx
docker-compose exec nginx cat /etc/nginx/conf.d/boraentregar.conf | grep -A 5 "Access-Control"

# Ver variável FRONTEND_URL
docker-compose exec backend-main printenv FRONTEND_URL_MAIN

# Testar com curl
curl -H "Origin: https://seu-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:5001/api/excel/process
```

## 📞 Quick Commands

```bash
# Status geral
docker-compose ps && docker stats --no-stream

# Logs últimos erros
docker-compose logs --tail=50 | grep -i error

# Restart tudo
docker-compose restart

# Deploy rápido
git pull && ./deploy.sh both

# Verificação rápida
curl http://localhost:5001/health && curl http://localhost:5002/health

# Limpeza completa
docker-compose down && docker system prune -a -f && docker-compose up -d
```
