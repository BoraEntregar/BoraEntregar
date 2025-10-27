# 🚚 BoraEntregar - Sistema de Agrupamento de Rotas de Entrega

Sistema completo para processar arquivos Excel de rotas de entrega, agrupar endereços por proximidade geográfica e exportar os resultados.

## 🎯 Visão Geral

O BoraEntregar é uma aplicação full-stack que permite:
- Upload de arquivos Excel com dados de rotas
- Agrupamento automático de endereços por coordenadas (latitude/longitude)
- Visualização dos dados processados em tabela
- Histórico de processamentos
- Exportação dos resultados em Excel

## 🏗️ Arquitetura

```
BoraEntregar/
├── backend/          # API REST (Node.js + Express + MongoDB)
└── frontend/         # Interface (React + TypeScript + Vite)
```

## 🛠️ Tecnologias

### Backend
- Node.js 20+
- Express.js 4.18
- TypeScript 5.3
- MongoDB Atlas + Mongoose 8.1
- Multer (upload de arquivos)
- XLSX (processamento Excel)

### Frontend
- React 19.1
- TypeScript 5.9
- Vite 7.1
- Axios (HTTP client)
- React Hot Toast (notificações)
- XLSX + FileSaver (export)

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 20 ou superior
- NPM ou Yarn
- Conta no MongoDB Atlas (gratuita)

### 1️⃣ Clonar o repositório

```bash
git clone <url-do-repositorio>
cd BoraEntregar
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais do MongoDB
# nano .env ou code .env
```

**Arquivo `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/?appName=BoraEntregar
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3️⃣ Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional)
cp .env.example .env
```

**Arquivo `.env` (frontend):**
```env
VITE_API_URL=http://localhost:5000
```

### 4️⃣ Executar em Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
O backend estará rodando em `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
O frontend estará rodando em `http://localhost:5173`

### 5️⃣ Build para Produção

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Processar Arquivo Excel
```http
POST /api/excel/process
Content-Type: multipart/form-data

Body:
- file: arquivo Excel (.xlsx ou .xls)
- routeName: nome da rota
```

**Formato esperado do Excel:**
| sequence | destinationAddress | bairro | city | zipcode | latitude | longitude |
|----------|-------------------|--------|------|---------|----------|-----------|
| 1 | Rua A, 123 | Centro | São Paulo | 01234-567 | -23.550520 | -46.633308 |

### Exportar Dados
```http
POST /api/excel/export
Content-Type: application/json

Body:
{
  "processedDataId": "65abc123..."
}
```

### Listar Histórico
```http
GET /api/excel/history?page=1&limit=10
```

### Buscar por ID
```http
GET /api/excel/history/:id
```

### Deletar Processamento
```http
DELETE /api/excel/history/:id
```

## 📂 Estrutura do Projeto

### Backend
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Configuração MongoDB
│   ├── controllers/
│   │   └── excelController.ts   # Lógica das rotas
│   ├── middleware/
│   │   └── upload.ts             # Config Multer
│   ├── models/
│   │   └── ProcessedData.ts     # Schema MongoDB
│   ├── routes/
│   │   └── excel.routes.ts      # Rotas da API
│   ├── types/
│   │   └── excel.types.ts       # Interfaces TypeScript
│   ├── utils/
│   │   └── excelProcessor.ts    # Processamento Excel
│   ├── app.ts                   # Config Express
│   └── server.ts                # Inicialização
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx       # Upload de arquivos
│   │   ├── DataTable.tsx        # Tabela de resultados
│   │   └── History.tsx          # Histórico
│   ├── services/
│   │   └── api.ts               # Cliente API
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Componente principal
│   ├── App.css                  # Estilos
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globais
├── public/
│   └── manifest.json
├── index.html
├── package.json
└── vite.config.ts
```

## 💡 Como Usar

### 1. Upload de Arquivo

1. Acesse a aplicação em `http://localhost:5173`
2. Clique na aba **Upload**
3. Digite o nome da rota
4. Arraste e solte o arquivo Excel ou clique para selecionar
5. Clique em **Processar Arquivo**

### 2. Visualizar Resultados

- Após o processamento, você será redirecionado para a aba **Resultados**
- Veja as estatísticas:
  - Linhas Originais
  - Linhas Agrupadas
  - Percentual de Redução
- Visualize a tabela com os dados agrupados

### 3. Exportar Dados

- Na aba **Resultados**, clique em:
  - **Exportar Excel**: exporta via servidor
  - **Exportar (Local)**: exporta diretamente do navegador

### 4. Consultar Histórico

1. Clique na aba **Histórico**
2. Veja todos os processamentos anteriores
3. Clique em **Ver Detalhes** para visualizar os dados
4. Use o botão de lixeira para excluir registros

## 🔧 Configuração MongoDB Atlas

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (tier gratuito M0)
4. Configure **Network Access**:
   - Adicione `0.0.0.0/0` para desenvolvimento
   - Em produção, restrinja aos IPs específicos
5. Configure **Database Access**:
   - Crie um usuário com senha
6. Obtenha a **Connection String**:
   - Clique em "Connect" → "Connect your application"
   - Copie a string de conexão
   - Substitua `<password>` pela senha do usuário
7. Cole no arquivo `.env` do backend

## 🎨 Funcionalidades do Frontend

- ✨ Interface moderna e responsiva
- 🎯 Drag & drop para upload de arquivos
- 📊 Visualização em tabela dos dados processados
- 📈 Estatísticas em tempo real
- 🔔 Notificações toast para feedback
- 💾 Duas opções de exportação (servidor e local)
- 📜 Histórico com paginação
- 🗑️ Exclusão de registros com confirmação
- 📱 Design responsivo para mobile

## 🔒 Segurança

### Avisos de Segurança

⚠️ **IMPORTANTE**:
- Nunca commite o arquivo `.env` no Git
- Regenere as credenciais do MongoDB se foram expostas
- Use variáveis de ambiente para dados sensíveis
- Configure CORS apropriadamente para produção

### Melhorias Recomendadas para Produção

- [ ] Implementar autenticação (JWT, OAuth)
- [ ] Adicionar rate limiting
- [ ] Validação robusta de inputs
- [ ] HTTPS obrigatório
- [ ] Logs estruturados
- [ ] Monitoramento e alertas
- [ ] Testes automatizados
- [ ] CI/CD pipeline

## 🐛 Troubleshooting

### Erro ao conectar ao MongoDB
```
Error: connect ECONNREFUSED
```
**Solução**: Verifique se a connection string está correta no `.env` e se o IP está liberado no MongoDB Atlas.

### Erro de CORS
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solução**: Verifique se o `FRONTEND_URL` está configurado corretamente no backend.

### Build do frontend falha
```
error TS1484: Type import
```
**Solução**: Use `import type` para importações de tipos TypeScript.

## 📝 Changelog

### v1.0.0 (2024-10-26)
- ✅ Backend completo com API RESTful
- ✅ Frontend React com TypeScript
- ✅ Agrupamento por coordenadas
- ✅ Upload e exportação de Excel
- ✅ Histórico com paginação
- ✅ Interface responsiva

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com ❤️ para otimizar rotas de entrega

---

**🚀 Bora Entregar!**
