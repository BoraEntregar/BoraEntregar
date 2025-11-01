# Deploy Rápido - BoraEntregar

Guia rápido para deploy na Hetzner VPS + Vercel.

## 📋 Pré-requisitos

- [x] Conta Hetzner com VPS criado
- [x] Conta Vercel
- [x] Conta MongoDB Atlas (ou outro MongoDB cloud)
- [x] Conta Auth0 configurada
- [x] Domínios configurados (opcional, mas recomendado)

## 🚀 Setup Rápido

### 1️⃣ Configurar VPS (Hetzner)

```bash
# No seu computador local, fazer upload do script
scp setup-vps.sh root@SEU-IP-VPS:/tmp/

# Conectar ao VPS
ssh root@SEU-IP-VPS

# Executar setup inicial
cd /tmp
chmod +x setup-vps.sh
./setup-vps.sh

# Criar diretório do projeto
cd /opt
git clone https://github.com/SEU-USUARIO/BoraEntregar.git boraentregar
cd boraentregar
```

### 2️⃣ Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas credenciais
nano .env
```

Exemplo de `.env`:

```env
# MongoDB
MONGODB_URI_MAIN=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-main
MONGODB_URI_DEV=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-dev

# Frontend URLs (preencha depois do deploy na Vercel)
FRONTEND_URL_MAIN=https://boraentregar.vercel.app
FRONTEND_URL_DEV=https://boraentregar-dev.vercel.app

# Backend URLs (substitua pelo seu domínio ou IP)
AUTH0_BASE_URL_MAIN=https://api.seu-dominio.com
AUTH0_BASE_URL_DEV=https://api-dev.seu-dominio.com

# Auth0
AUTH0_CLIENT_ID=seu_client_id
AUTH0_CLIENT_SECRET=seu_client_secret
AUTH0_ISSUER_BASE_URL=https://seu-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.boraentregar.com.br
```

### 3️⃣ Configurar DNS (Opcional)

Se você tem um domínio, configure os registros DNS:

```
Tipo  Nome              Valor
A     api               SEU-IP-VPS
A     api-dev           SEU-IP-VPS
```

Se não tiver domínio, você pode usar o IP direto:
- Main: `http://SEU-IP-VPS:5001`
- Dev: `http://SEU-IP-VPS:5002`

### 4️⃣ Ajustar Configuração do Nginx

```bash
# Editar configuração do Nginx
nano nginx/conf.d/boraentregar.conf

# Substituir:
# - api.seu-dominio.com → seu domínio real ou remover server_name
# - api-dev.seu-dominio.com → seu domínio real ou remover server_name
# - URLs do CORS → URLs reais da Vercel
```

**Se usar IP direto**, você pode simplificar removendo a seção do Nginx e expondo as portas diretamente:

```bash
# Remover Nginx do docker-compose.yml (opcional)
# Ou comentar toda a seção do nginx
nano docker-compose.yml
```

### 5️⃣ Deploy do Backend

```bash
# Primeira vez (build e start)
./deploy.sh both

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend-main
docker-compose logs -f backend-dev
```

### 6️⃣ Deploy do Frontend (Vercel)

#### Projeto Main (Produção)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório
4. Configure:

**Build Settings:**
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**Environment Variables:**
```
VITE_API_URL=https://api.seu-dominio.com (ou http://SEU-IP-VPS:5001)
VITE_AUTH0_DOMAIN=seu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=seu_client_id
VITE_AUTH0_AUDIENCE=https://api.boraentregar.com.br
```

**Deploy Branch:** `main`

#### Projeto Dev (Desenvolvimento)

Repita o processo acima, mas:
- Nome do projeto: `boraentregar-dev`
- `VITE_API_URL=https://api-dev.seu-dominio.com` (ou `http://SEU-IP-VPS:5002`)
- **Deploy Branch:** `dev`

### 7️⃣ Atualizar Auth0

Configure as URLs permitidas no Auth0:

**Allowed Callback URLs:**
```
https://boraentregar.vercel.app/callback,
https://boraentregar-dev.vercel.app/callback
```

**Allowed Logout URLs:**
```
https://boraentregar.vercel.app,
https://boraentregar-dev.vercel.app
```

**Allowed Web Origins:**
```
https://boraentregar.vercel.app,
https://boraentregar-dev.vercel.app
```

### 8️⃣ Testar

```bash
# Testar backends
curl http://SEU-IP-VPS:5001/health
curl http://SEU-IP-VPS:5002/health

# Acessar frontends
# Main: https://boraentregar.vercel.app
# Dev: https://boraentregar-dev.vercel.app
```

## 🔄 Deploy Contínuo

### Atualizar Backend

```bash
# No VPS
cd /opt/boraentregar
git pull origin main  # ou dev
./deploy.sh main      # ou dev ou both
```

### Atualizar Frontend

Simplesmente faça push para o repositório:

```bash
# No seu computador
git push origin main  # Vercel detecta e faz deploy automático
git push origin dev   # Deploy automático do ambiente dev
```

## 📝 Comandos Úteis

### Docker

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend-main
docker-compose logs -f backend-dev

# Reiniciar serviço
docker-compose restart backend-main

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Rebuild
docker-compose build --no-cache backend-main
docker-compose up -d backend-main
```

### Sistema

```bash
# Ver uso de recursos
docker stats

# Limpar espaço
docker system prune -a

# Ver logs do sistema
tail -f /var/log/syslog
```

## 🔒 SSL/HTTPS (Opcional)

### Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install certbot

# Parar Nginx
docker-compose stop nginx

# Gerar certificados
sudo certbot certonly --standalone \
  -d api.seu-dominio.com \
  -d api-dev.seu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.seu-dominio.com/privkey.pem nginx/ssl/

# Ajustar permissões
sudo chown -R 1000:1000 nginx/ssl/

# Descomentar configuração SSL no nginx/conf.d/boraentregar.conf
nano nginx/conf.d/boraentregar.conf

# Reiniciar Nginx
docker-compose up -d nginx
```

### Renovação Automática

```bash
# Adicionar ao cron
sudo crontab -e

# Adicionar linha (renova diariamente às 3h)
0 3 * * * certbot renew --quiet --post-hook "cp /etc/letsencrypt/live/api.seu-dominio.com/*.pem /opt/boraentregar/nginx/ssl/ && docker-compose -f /opt/boraentregar/docker-compose.yml exec nginx nginx -s reload"
```

## 🐛 Troubleshooting

### Backend não inicia

```bash
docker-compose logs backend-main
# Verificar variáveis de ambiente
docker-compose config
```

### Erro de CORS

1. Verifique `.env` - `FRONTEND_URL_MAIN` e `FRONTEND_URL_DEV`
2. Verifique `nginx/conf.d/boraentregar.conf` - headers CORS
3. Limpe cache do navegador

### MongoDB não conecta

```bash
# Testar conexão
docker-compose exec backend-main sh
ping seu-cluster.mongodb.net
# Verificar string de conexão no .env
```

### Porta já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :5001
sudo lsof -i :80

# Matar processo
sudo kill -9 PID
```

## 📚 Documentação Completa

Para mais detalhes, consulte o arquivo [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Verifique as configurações do Auth0
4. Teste conectividade: `curl http://localhost:5001/health`

## ✅ Checklist de Deploy

### Backend (VPS)
- [ ] VPS configurado e acessível via SSH
- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado em `/opt/boraentregar`
- [ ] Arquivo `.env` configurado com credenciais reais
- [ ] DNS configurado (ou usando IP direto)
- [ ] Nginx configurado (se usar domínio)
- [ ] Deploy executado: `./deploy.sh both`
- [ ] Health checks funcionando: `curl http://IP:5001/health`

### Frontend (Vercel)
- [ ] Projeto main criado na Vercel
- [ ] Projeto dev criado na Vercel
- [ ] Environment variables configuradas
- [ ] Build settings corretos (Root: `frontend`)
- [ ] Deploys bem-sucedidos
- [ ] URLs anotadas para configurar no backend

### Auth0
- [ ] Callback URLs configuradas
- [ ] Logout URLs configuradas
- [ ] Web Origins configuradas
- [ ] Credenciais no `.env` do backend

### Teste Final
- [ ] Backend main responde: `curl http://IP:5001/health`
- [ ] Backend dev responde: `curl http://IP:5002/health`
- [ ] Frontend main carrega e conecta ao backend
- [ ] Frontend dev carrega e conecta ao backend dev
- [ ] Login via Auth0 funciona
- [ ] Upload de arquivo funciona
- [ ] Histórico carrega
