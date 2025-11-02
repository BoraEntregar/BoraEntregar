# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD do BoraEntregar.

## 📄 Workflows Disponíveis

### `deploy.yml` - Deploy Automático

Deploy automático do backend na VPS Hetzner quando há push nas branches:
- `main` - Produção
- `dev` - Desenvolvimento

**Trigger:** Push nas branches configuradas

**O que faz:**
1. Conecta na VPS via SSH
2. Atualiza código do repositório
3. Instala dependências
4. Compila TypeScript
5. Reinicia aplicação com PM2

## 🔧 Configuração

Veja [CICD-SETUP.md](../../CICD-SETUP.md) para instruções completas de configuração.

### Secrets Necessários:
- `VPS_HOST` - IP ou domínio da VPS
- `VPS_USERNAME` - Usuário SSH
- `VPS_SSH_KEY` - Chave privada SSH
- `VPS_PORT` - Porta SSH (opcional, padrão: 22)

## 📊 Monitoramento

Acesse **Actions** no GitHub para ver:
- Histórico de deploys
- Logs em tempo real
- Status de sucesso/falha
