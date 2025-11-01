# Guia de Deployment - BoraEntregar

Este guia detalha o processo de deployment do BoraEntregar na Hetzner (backend) e Vercel (frontend).

## Índice

1. [Arquitetura](#arquitetura)
2. [Configuração do VPS Hetzner](#configuração-do-vps-hetzner)
3. [Configuração do Backend](#configuração-do-backend)
4. [Configuração do Frontend na Vercel](#configuração-do-frontend-na-vercel)
5. [Deploy e Manutenção](#deploy-e-manutenção)
6. [SSL/HTTPS](#sslhttps)
7. [Troubleshooting](#troubleshooting)

## Arquitetura

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
│                 │
│  - Main (prod)  │
│  - Dev (dev)    │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  Hetzner VPS    │
│                 │
│  ┌───────────┐  │
│  │   Nginx   │  │
│  │  (Proxy)  │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────┴─────┐  │
│  │           │  │
│  ▼           ▼  │
│ Backend    Backend│
│  Main       Dev  │
│ (5001)    (5002) │
└─────────────────┘
```

## Configuração do VPS Hetzner

### 1. Acesso Inicial ao VPS

```bash
# Conectar ao VPS via SSH
ssh root@seu-ip-hetzner

# Criar usuário não-root (recomendado)
adduser deploy
usermod -aG sudo deploy

# Configurar SSH para o novo usuário
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### 2. Setup Inicial do Servidor

Execute o script de setup (como root ou com sudo):

```bash
# Fazer upload do script para o servidor
scp setup-vps.sh root@seu-ip-hetzner:/tmp/

# No servidor, executar
cd /tmp
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

Este script irá:
- Atualizar o sistema
- Instalar Docker e Docker Compose
- Configurar firewall (UFW)
- Criar estrutura de diretórios

### 3. Clone do Repositório

```bash
# No servidor
cd /opt/boraentregar
git clone https://github.com/seu-usuario/BoraEntregar.git .

# Ou usar deploy via Git (recomendado para CI/CD)
git init --bare ~/boraentregar.git
# Configure hooks para deploy automático
```

## Configuração do Backend

### 1. Variáveis de Ambiente

Copie e configure o arquivo `.env`:

```bash
cd /opt/boraentregar
cp .env.example .env
nano .env
```

Configure as variáveis:

```env
# MongoDB URIs - Use databases separados para main e dev
MONGODB_URI_MAIN=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-main
MONGODB_URI_DEV=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-dev

# Frontend URLs - URLs da Vercel
FRONTEND_URL_MAIN=https://boraentregar.vercel.app
FRONTEND_URL_DEV=https://boraentregar-dev.vercel.app

# Auth0 Configuration - URLs do backend
AUTH0_BASE_URL_MAIN=https://api.seu-dominio.com
AUTH0_BASE_URL_DEV=https://api-dev.seu-dominio.com

# Auth0 Credentials
AUTH0_CLIENT_ID=seu_client_id
AUTH0_CLIENT_SECRET=seu_client_secret
AUTH0_ISSUER_BASE_URL=https://seu-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.boraentregar.com.br
```

### 2. Configurar Nginx

Edite o arquivo de configuração do Nginx:

```bash
nano /opt/boraentregar/nginx/conf.d/boraentregar.conf
```

Substitua `api.seu-dominio.com` e `api-dev.seu-dominio.com` pelos seus domínios reais.

### 3. DNS Configuration

Configure os registros DNS para apontar para o IP do seu VPS:

```
A    api.seu-dominio.com      →  IP_DO_VPS
A    api-dev.seu-dominio.com  →  IP_DO_VPS
```

### 4. Primeiro Deploy

```bash
cd /opt/boraentregar

# Deploy de ambos os ambientes
./deploy.sh both

# Ou deploy individual
./deploy.sh main  # Apenas produção
./deploy.sh dev   # Apenas desenvolvimento
```

### 5. Verificar Status

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f backend-main
docker-compose logs -f backend-dev

# Testar health check
curl http://localhost:5001/health  # Main
curl http://localhost:5002/health  # Dev
```

## Configuração do Frontend na Vercel

### 1. Conectar Repositório à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Configure dois projetos:
   - **BoraEntregar** (produção - branch main)
   - **BoraEntregar-Dev** (desenvolvimento - branch dev)

### 2. Configuração do Projeto Main (Produção)

#### Build Settings:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables:

```env
VITE_API_URL=https://api.seu-dominio.com
VITE_AUTH0_DOMAIN=seu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=seu_client_id
VITE_AUTH0_AUDIENCE=https://api.boraentregar.com.br
```

#### Deploy Settings:
- **Production Branch**: `main`

### 3. Configuração do Projeto Dev (Desenvolvimento)

Use as mesmas configurações, mas com variáveis diferentes:

```env
VITE_API_URL=https://api-dev.seu-dominio.com
VITE_AUTH0_DOMAIN=seu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=seu_client_id
VITE_AUTH0_AUDIENCE=https://api.boraentregar.com.br
```

#### Deploy Settings:
- **Production Branch**: `dev`

### 4. Domínios Customizados (Opcional)

Configure domínios customizados na Vercel:

**Produção:**
- `boraentregar.com.br`
- `www.boraentregar.com.br`

**Dev:**
- `dev.boraentregar.com.br`

## SSL/HTTPS

### Opção 1: Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Parar Nginx temporariamente
docker-compose stop nginx

# Gerar certificados
sudo certbot certonly --standalone -d api.seu-dominio.com -d api-dev.seu-dominio.com

# Copiar certificados para o diretório do projeto
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/fullchain.pem /opt/boraentregar/nginx/ssl/
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/privkey.pem /opt/boraentregar/nginx/ssl/

# Ajustar permissões
sudo chown -R 1000:1000 /opt/boraentregar/nginx/ssl/

# Reiniciar Nginx
docker-compose up -d nginx
```

### Opção 2: Cloudflare (Recomendado)

Use o Cloudflare como proxy:
1. Adicione seu domínio ao Cloudflare
2. Configure DNS no Cloudflare
3. Ative SSL/TLS (Full ou Full Strict)
4. Configure Page Rules se necessário

Vantagens:
- SSL automático
- DDoS protection
- CDN gratuito
- Cache configurável

## Deploy e Manutenção

### Deploy Contínuo

#### Opção 1: Manual

```bash
# No servidor
cd /opt/boraentregar
git pull origin main  # ou dev

# Deploy
./deploy.sh main  # ou dev
```

#### Opção 2: GitHub Actions (Recomendado)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main, dev]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/boraentregar
            git pull origin ${{ github.ref_name }}
            ./deploy.sh ${{ github.ref_name == 'main' && 'main' || 'dev' }}
```

Configure os secrets no GitHub:
- `VPS_HOST`: IP do servidor
- `VPS_USER`: usuário SSH
- `VPS_SSH_KEY`: chave privada SSH

### Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f

# Reiniciar um serviço
docker-compose restart backend-main

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -a

# Backup do banco (se usar MongoDB local)
docker-compose exec mongodb mongodump --out=/backup

# Atualizar apenas uma imagem
docker-compose build --no-cache backend-main
docker-compose up -d backend-main
```

### Monitoramento

#### Logs

```bash
# Logs do Nginx
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Logs do Backend
docker-compose logs --tail=100 -f backend-main
docker-compose logs --tail=100 -f backend-dev
```

#### Health Checks

```bash
# Verificar health dos containers
docker-compose ps

# Testar endpoints
curl https://api.seu-dominio.com/health
curl https://api-dev.seu-dominio.com/health
```

## Troubleshooting

### Backend não inicia

```bash
# Verificar logs
docker-compose logs backend-main

# Verificar variáveis de ambiente
docker-compose config

# Verificar conectividade MongoDB
docker-compose exec backend-main sh
ping seu-cluster.mongodb.net
```

### Erro de CORS

Verifique:
1. URLs do frontend no `.env` do backend
2. Configuração CORS no `nginx/conf.d/boraentregar.conf`
3. Auth0 - Allowed Callback URLs e Allowed Logout URLs

### Certificado SSL inválido

```bash
# Renovar certificados
sudo certbot renew

# Copiar novos certificados
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/*.pem /opt/boraentregar/nginx/ssl/

# Recarregar Nginx
docker-compose exec nginx nginx -s reload
```

### Container reiniciando constantemente

```bash
# Ver logs detalhados
docker-compose logs --tail=200 backend-main

# Verificar health check
docker inspect --format='{{json .State.Health}}' boraentregar-backend-main

# Desabilitar health check temporariamente
# Comente a seção healthcheck no docker-compose.yml
```

### MongoDB Connection Issues

```bash
# Testar conexão
docker-compose exec backend-main sh
nc -zv seu-cluster.mongodb.net 27017

# Verificar credenciais
echo $MONGODB_URI_MAIN

# Verificar logs do MongoDB
# (Se usar MongoDB local)
docker-compose logs mongodb
```

### Performance Issues

```bash
# Verificar uso de recursos
docker stats

# Limpar logs antigos
docker-compose down
find /var/lib/docker/containers/ -name "*.log" -delete
docker-compose up -d

# Otimizar imagens
docker-compose build --no-cache
docker system prune -a
```

## Backup Strategy

### Backup do Banco de Dados

```bash
# Criar script de backup
cat > /opt/boraentregar/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI_MAIN" --out=/tmp/backup_$DATE
tar -czf /opt/backups/db_$DATE.tar.gz /tmp/backup_$DATE
rm -rf /tmp/backup_$DATE
# Manter apenas últimos 7 dias
find /opt/backups -name "db_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/boraentregar/backup.sh

# Adicionar ao cron (diariamente às 2h)
crontab -e
# 0 2 * * * /opt/boraentregar/backup.sh
```

## Segurança

### Checklist de Segurança

- [ ] Firewall configurado (UFW)
- [ ] SSH com chave pública (desabilitar senha)
- [ ] Usuário não-root para deploy
- [ ] SSL/HTTPS configurado
- [ ] Secrets não commitados no Git
- [ ] Auth0 configurado corretamente
- [ ] Rate limiting no Nginx (opcional)
- [ ] Logs sendo monitorados
- [ ] Backups automáticos configurados
- [ ] Atualizações de segurança automáticas

### Hardening Adicional

```bash
# Desabilitar login root via SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Fail2ban para proteção contra brute force
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Atualizações automáticas de segurança
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Conclusão

Seguindo este guia, você terá:
- ✅ Backend rodando na Hetzner com containers separados para main e dev
- ✅ Frontend deployado na Vercel com ambientes separados
- ✅ SSL/HTTPS configurado
- ✅ Nginx como reverse proxy
- ✅ Health checks e monitoramento
- ✅ Scripts de deploy automatizados

Para suporte adicional, consulte:
- [Documentação Docker](https://docs.docker.com)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Auth0](https://auth0.com/docs)
