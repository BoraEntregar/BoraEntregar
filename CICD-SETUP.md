# Configuração de CI/CD - BoraEntregar

Este guia explica como configurar o deploy automático do backend na VPS Hetzner usando GitHub Actions e Docker Compose.

## 🐳 Arquitetura

O projeto usa **Docker Compose** com ambientes separados:
- **Branch `main`** → Container `backend-main` → Porta `5001` (Produção)
- **Branch `dev`** → Container `backend-dev` → Porta `5002` (Desenvolvimento)

Cada ambiente tem:
- MongoDB separado
- Variáveis de ambiente isoladas
- Volume próprio para uploads
- Autenticação Auth0 separada

## 📋 Pré-requisitos

- Repositório no GitHub
- VPS Hetzner configurada e rodando
- Acesso SSH à VPS
- **Docker e Docker Compose instalados na VPS**
- Git instalado na VPS

## 🔐 Passo 1: Configurar SSH na VPS

### 1.1. Gerar chave SSH (se não tiver)

Na sua máquina local:

```bash
ssh-keygen -t ed25519 -C "github-actions@boraentregar" -f ~/.ssh/boraentregar_deploy
```

Pressione Enter para aceitar o local padrão e **não use senha** (deixe em branco).

### 1.2. Copiar chave pública para a VPS

```bash
ssh-copy-id -i ~/.ssh/boraentregar_deploy.pub usuario@seu-ip-vps
```

Ou manualmente:

```bash
# Na sua máquina local
cat ~/.ssh/boraentregar_deploy.pub

# Na VPS
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Cole a chave pública e salve (Ctrl+O, Enter, Ctrl+X)

# Ajustar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 1.3. Testar conexão SSH

```bash
ssh -i ~/.ssh/boraentregar_deploy usuario@seu-ip-vps
```

## 🔑 Passo 2: Configurar Secrets no GitHub

Acesse o repositório no GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

### Secrets necessários:

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `VPS_HOST` | IP ou domínio da VPS | `123.45.67.89` ou `boraentregar.com` |
| `VPS_USERNAME` | Usuário SSH da VPS | `root` ou `ubuntu` |
| `VPS_SSH_KEY` | Chave privada SSH | Conteúdo do arquivo `~/.ssh/boraentregar_deploy` |
| `VPS_PORT` | Porta SSH (opcional) | `22` (padrão) |

### Como obter a chave SSH privada:

```bash
cat ~/.ssh/boraentregar_deploy
```

Copie **TODO** o conteúdo (incluindo `-----BEGIN` e `-----END`) e cole no secret `VPS_SSH_KEY`.

## 📦 Passo 3: Preparar a VPS

### 3.1. Instalar Docker e Docker Compose

```bash
# Conectar na VPS
ssh usuario@seu-ip-vps

# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Deslogar e logar novamente para aplicar permissões
exit
ssh usuario@seu-ip-vps

# Verificar instalação
docker --version
docker compose version
```

### 3.2. Clonar o repositório na VPS (primeira vez)

```bash
# Criar diretório (se não existir)
# Diretório será criado no home do usuário
# Não precisa de sudo no home

# Clonar repositório
cd ~
git clone https://github.com/seu-usuario/BoraEntregar.git
cd BoraEntregar

# Criar arquivo .env na RAIZ do projeto
nano .env
```

### 3.3. Configurar variáveis de ambiente (.env)

Cole as seguintes variáveis no arquivo `.env` (na raiz do projeto):

```bash
# ===== PRODUÇÃO (main branch) =====
MONGODB_URI_MAIN=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-prod
FRONTEND_URL_MAIN=https://boraentregar.com
AUTH0_BASE_URL_MAIN=https://api.boraentregar.com
AUTH0_CLIENT_ID_MAIN=seu_client_id_main
AUTH0_CLIENT_SECRET_MAIN=seu_client_secret_main
AUTH0_ISSUER_BASE_URL_MAIN=https://seu-tenant.auth0.com
AUTH0_AUDIENCE_MAIN=https://api.boraentregar.com

# ===== DESENVOLVIMENTO (dev branch) =====
MONGODB_URI_DEV=mongodb+srv://user:pass@cluster.mongodb.net/boraentregar-dev
FRONTEND_URL_DEV=https://dev.boraentregar.com
AUTH0_BASE_URL_DEV=https://dev-api.boraentregar.com
AUTH0_CLIENT_ID_DEV=seu_client_id_dev
AUTH0_CLIENT_SECRET_DEV=seu_client_secret_dev
AUTH0_ISSUER_BASE_URL_DEV=https://seu-tenant-dev.auth0.com
AUTH0_AUDIENCE_DEV=https://dev-api.boraentregar.com
```

Salve e feche (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 3.4. Iniciar os containers (primeira vez)

```bash
# Iniciar apenas o backend de produção (main)
docker compose up -d backend-main

# OU iniciar apenas o backend de desenvolvimento (dev)
docker compose up -d backend-dev

# OU iniciar ambos
docker compose up -d backend-main backend-dev

# Verificar se está rodando
docker compose ps

# Ver logs
docker compose logs -f backend-main
# ou
docker compose logs -f backend-dev
```

### 3.5. Configurar permissões do Git

```bash
cd ~/BoraEntregar
git config --global --add safe.directory ~/BoraEntregar
```

## 🚀 Passo 4: Testar o Deploy

### 4.1. Fazer um commit de teste

```bash
# Na sua máquina local
git add .
git commit -m "test: trigger CI/CD"
git push origin main
```

### 4.2. Acompanhar o deploy

1. Acesse o repositório no GitHub
2. Vá em **Actions**
3. Veja o workflow "Deploy to Hetzner VPS" rodando
4. Clique no workflow para ver os logs em tempo real

### 4.3. Verificar na VPS

```bash
# Conectar na VPS
ssh usuario@seu-ip-vps

# Ver status dos containers
cd ~/BoraEntregar
docker compose ps

# Ver logs (produção)
docker compose logs -f backend-main

# Ver logs (desenvolvimento)
docker compose logs -f backend-dev

# Testar API diretamente
curl http://localhost:5001/health  # Produção
curl http://localhost:5002/health  # Desenvolvimento
```

## 📝 Como Funciona

### Fluxo do CI/CD:

```
┌──────────────────────┐
│  Git Push            │
│  (main ou dev)       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  GitHub Actions      │
│  Detecta branch      │
│  • main → prod       │
│  • dev → dev         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Conecta via SSH     │
│  na VPS Hetzner      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  1. Backup .env      │
│  2. Git pull         │
│  3. Docker stop      │
│  4. Docker build     │
│  5. Docker up        │
│  6. Health check     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ✅ Deploy OK!       │
│  Container rodando   │
└──────────────────────┘
```

### Ambientes Isolados:

| Branch | Container | Porta | MongoDB | Uploads Volume |
|--------|-----------|-------|---------|----------------|
| `main` | backend-main | 5001 | boraentregar-prod | backend-uploads-main |
| `dev`  | backend-dev  | 5002 | boraentregar-dev  | backend-uploads-dev  |

## 🛠️ Deploy Manual (Alternativa)

Se preferir fazer deploy manual, use o script:

```bash
# Na VPS, checkout para a branch desejada
cd ~/BoraEntregar

# Para produção
git checkout main
./deploy-backend.sh

# Para desenvolvimento
git checkout dev
./deploy-backend.sh
```

O script detecta automaticamente a branch e faz deploy do container correto.

## 🔧 Troubleshooting

### Erro: "Permission denied (publickey)"

- Verifique se a chave SSH está correta no secret `VPS_SSH_KEY`
- Verifique se a chave pública está em `~/.ssh/authorized_keys` na VPS
- Verifique permissões: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`

### Erro: "Docker not found" ou "docker compose not found"

```bash
# Verificar se Docker está instalado
docker --version
docker compose version

# Se não estiver, instale (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose plugin
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Deslogar e logar novamente
exit
ssh usuario@ip-vps
```

### Erro: "Container not starting" ou "Health check failing"

```bash
# Ver logs do container
cd ~/BoraEntregar
docker compose logs backend-main  # ou backend-dev

# Ver logs em tempo real
docker compose logs -f backend-main

# Verificar se .env está configurado corretamente
cat .env

# Rebuild completo
docker compose down backend-main
docker compose build --no-cache backend-main
docker compose up -d backend-main
```

### Erro: "Port already in use"

```bash
# Verificar o que está usando a porta
sudo lsof -i :5001  # produção
sudo lsof -i :5002  # desenvolvimento

# Parar todos os containers
docker compose down

# Reiniciar apenas o necessário
docker compose up -d backend-main
```

### Erro: "Git pull failed"

```bash
# Na VPS, resetar mudanças locais
cd ~/BoraEntregar
git reset --hard
git pull origin main  # ou dev
```

### Deploy não inicia automaticamente

- Verifique se os secrets estão configurados corretamente
- Verifique se você fez push na branch correta (`main` ou `dev`)
- Veja os logs no GitHub Actions para identificar o erro

## 🔄 Atualizando o Workflow

O arquivo de workflow está em:
```
.github/workflows/deploy.yml
```

Para modificar:
1. Edite o arquivo localmente
2. Commit e push
3. O próprio workflow será atualizado automaticamente

## 📊 Monitoramento

### Ver logs em tempo real:

```bash
cd ~/BoraEntregar

# Logs de produção
docker compose logs -f backend-main

# Logs de desenvolvimento
docker compose logs -f backend-dev

# Ambos
docker compose logs -f
```

### Ver status dos containers:

```bash
docker compose ps
```

### Ver uso de recursos:

```bash
# Recursos de todos os containers
docker stats

# Apenas backend
docker stats boraentregar-backend-main
docker stats boraentregar-backend-dev
```

### Comandos úteis:

```bash
# Restart de um container
docker compose restart backend-main

# Parar todos os containers
docker compose down

# Ver volumes
docker volume ls

# Inspecionar volume de uploads
docker volume inspect boraentregar_backend-uploads-main
```

## 🔒 Segurança

- ✅ Nunca commite a chave SSH privada no repositório
- ✅ Use secrets do GitHub para dados sensíveis
- ✅ Configure `.gitignore` para excluir `.env` e arquivos sensíveis
- ✅ Use chave SSH dedicada apenas para deploy
- ✅ Considere usar usuário não-root na VPS para deploy
- ✅ Volumes Docker isolam uploads por ambiente
- ✅ Cada ambiente tem seu próprio MongoDB e Auth0

## 🎯 Estrutura de Arquivos

```
BoraEntregar/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow CI/CD
├── backend/
│   ├── Dockerfile              # Build do container
│   └── src/
├── docker-compose.yml          # Definição dos containers
├── deploy-backend.sh           # Script de deploy manual
├── .env                        # Variáveis de ambiente (NÃO commitar!)
└── CICD-SETUP.md              # Esta documentação
```

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [SSH Key Authentication](https://www.ssh.com/academy/ssh/public-key-authentication)

---

**Dúvidas?** Verifique os logs do GitHub Actions ou Docker para diagnosticar problemas.
