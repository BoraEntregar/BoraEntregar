# Arquitetura do BoraEntregar

## Visão Geral

O BoraEntregar é uma aplicação full-stack moderna construída com React e Node.js, projetada para otimizar rotas de entrega através do agrupamento inteligente de endereços.

## Stack Tecnológico

### Frontend
- **React 19.1.1** + **TypeScript 5.9.3**
- **Vite 7.1.7** (Build tool)
- **Axios** (HTTP client)
- **React Hot Toast** (Notificações)
- **XLSX + FileSaver** (Manipulação de Excel)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **ExcelJS** (Processamento de Excel)
- **Multer** (Upload de arquivos)

## Arquitetura Frontend

### Estrutura de Pastas

```
src/
├── pages/          # Páginas da aplicação (componentes de rota)
├── hooks/          # Custom React Hooks
├── utils/          # Funções utilitárias puras
├── constants/      # Constantes e configurações
├── services/       # Serviços de API
├── types/          # TypeScript interfaces e types
└── styles/         # Arquivos CSS organizados
```

### Princípios de Design

#### 1. Separação de Responsabilidades

**Pages (Páginas)**
- Componentes de alto nível que representam rotas/views
- Gerenciam estado local da página
- Orquestram interações entre componentes menores
- Não contêm lógica de negócio complexa

```typescript
// Exemplo: UploadPage.tsx
export default function UploadPage({ onSuccess }: Props) {
  // Estado local da página
  const [file, setFile] = useState<File | null>(null);

  // Lógica de interação com usuário
  const handleSubmit = async (e: FormEvent) => {
    // Validação
    // Chamada à API
    // Feedback ao usuário
  };

  return <div>...</div>;
}
```

**Hooks (Custom Hooks)**
- Encapsulam lógica reutilizável
- Gerenciam estado compartilhado
- Abstraem complexidade

```typescript
// Exemplo: useProcessedData.ts
export const useProcessedData = () => {
  const [processedData, setProcessedData] = useState(null);

  return {
    processedData,
    updateProcessedData: setProcessedData,
    clearProcessedData: () => setProcessedData(null),
    hasData: processedData !== null,
  };
};
```

**Utils (Utilitários)**
- Funções puras sem side effects
- Facilmente testáveis
- Reutilizáveis em toda aplicação

```typescript
// Exemplo: fileValidation.ts
export const validateFile = (file: File): ValidationResult => {
  if (!isValidExcelFile(file)) return { valid: false, error: '...' };
  if (!isValidFileSize(file)) return { valid: false, error: '...' };
  return { valid: true };
};
```

**Constants (Constantes)**
- Valores únicos e imutáveis
- Configurações centralizadas
- Mensagens de erro/sucesso padronizadas

```typescript
// Exemplo: constants/index.ts
export const MESSAGES = {
  SUCCESS: {
    FILE_UPLOADED: 'Arquivo processado com sucesso!',
  },
  ERROR: {
    NO_FILE_SELECTED: 'Por favor, selecione um arquivo',
  },
};
```

#### 2. Type Safety

Todo o código utiliza TypeScript com tipos bem definidos:

```typescript
// types/index.ts
export interface ProcessExcelResponse {
  success: boolean;
  message: string;
  data: ProcessedData;
}

export type ViewType = 'home' | 'upload' | 'results' | 'history';
```

#### 3. Composição sobre Herança

Utilizamos composição através de hooks e props:

```typescript
// App.tsx usa composição de hooks
const { processedData, updateProcessedData } = useProcessedData();
useApiHealth(); // Side effect hook

// Páginas recebem callbacks via props
<UploadPage onSuccess={handleUploadSuccess} />
```

### Fluxo de Dados

```
┌─────────────┐
│  App.tsx    │ ← Estado global e roteamento
└─────┬───────┘
      │
      ├─→ HomePage      ← Apresentação
      ├─→ UploadPage    ← Input de dados
      ├─→ ResultsPage   ← Visualização
      └─→ HistoryPage   ← Consulta
           │
           ↓
      ┌────────────┐
      │  Services  │ ← Comunicação com API
      └────────────┘
           │
           ↓
      ┌────────────┐
      │  Backend   │
      └────────────┘
```

### Gerenciamento de Estado

**Estado Local (useState)**
- Usado em componentes para UI state
- Ex: inputs, modals, loading states

**Estado Compartilhado (Custom Hooks)**
- useProcessedData: dados processados globais
- Passado via props quando necessário

**Estado do Servidor (React Query - futuro)**
- Para cache e sincronização com backend

### Padrões de Código

#### Nomenclatura

```typescript
// Componentes: PascalCase
export default function HomePage() {}

// Hooks: camelCase com prefixo 'use'
export const useProcessedData = () => {}

// Utilitários: camelCase
export const validateFile = () => {}

// Constantes: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Types/Interfaces: PascalCase
export interface ProcessExcelResponse {}
export type ViewType = 'home' | 'upload';
```

#### Organização de Imports

```typescript
// 1. Bibliotecas externas
import { useState } from 'react';
import toast from 'react-hot-toast';

// 2. Serviços
import { excelService } from '../services/api';

// 3. Types
import type { ProcessExcelResponse } from '../types';

// 4. Utils e constants
import { validateFile } from '../utils';
import { MESSAGES } from '../constants';
```

## Arquitetura Backend

### Estrutura de Pastas

```
src/
├── controllers/    # Handlers de requisições
├── models/         # Schemas Mongoose
├── routes/         # Definição de rotas
├── services/       # Lógica de negócio
├── middleware/     # Middlewares Express
├── types/          # TypeScript types
├── config/         # Configurações
└── utils/          # Utilitários
```

### Camadas

```
┌─────────────┐
│   Routes    │ ← Definição de endpoints
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │ ← Validação e orquestração
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │ ← Lógica de negócio
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │ ← Acesso a dados
└─────────────┘
```

## Fluxo de Processamento

### Upload e Processamento

```
1. Usuario seleciona arquivo Excel
   ↓
2. Frontend valida (tipo, tamanho)
   ↓
3. Upload para backend (multipart/form-data)
   ↓
4. Backend processa:
   - Parse do Excel
   - Geocodificação (se necessário)
   - Agrupamento por proximidade
   ↓
5. Salvamento no MongoDB
   ↓
6. Resposta com dados processados
   ↓
7. Frontend exibe resultados
```

### Exportação

```
1. Usuario clica em "Exportar"
   ↓
2. Duas opções:
   a) Servidor: GET /api/excel/export/:id
      - Backend gera Excel
      - Download via blob

   b) Local: Navegador gera Excel
      - Usa biblioteca XLSX
      - Download direto
```

## Design Patterns

### Frontend

**1. Custom Hooks Pattern**
```typescript
// Abstrai lógica complexa
export const useProcessedData = () => {
  // Implementação
  return { data, update, clear };
};
```

**2. Render Props Pattern**
```typescript
<UploadPage
  onSuccess={(data) => handleSuccess(data)}
/>
```

**3. Composition Pattern**
```typescript
// App.tsx compõe funcionalidades
function App() {
  const { processedData } = useProcessedData();
  useApiHealth();
  return <Layout>{children}</Layout>;
}
```

### Backend

**1. Service Layer Pattern**
```typescript
// Separação de lógica de negócio
class ExcelService {
  async processExcel(file: File) {
    // Lógica complexa isolada
  }
}
```

**2. Repository Pattern**
```typescript
// Abstração de acesso a dados
class ProcessedDataRepository {
  async findById(id: string) {
    return ProcessedData.findById(id);
  }
}
```

## Performance

### Frontend

**Code Splitting**
```typescript
// Lazy loading de páginas (futuro)
const HomePage = lazy(() => import('./pages/HomePage'));
```

**Memoization**
```typescript
// useMemo para cálculos pesados
const stats = useMemo(() => calculateStats(data), [data]);
```

**Virtualization**
```typescript
// Para listas grandes (futuro)
import { VirtualList } from 'react-window';
```

### Backend

**Caching**
- Redis para geocoding results (futuro)
- MongoDB indexes para queries rápidas

**Streaming**
- Stream processing para arquivos grandes
- Chunked responses

## Segurança

### Frontend
- Validação de inputs antes de envio
- Sanitização de dados exibidos
- HTTPS obrigatório em produção
- Content Security Policy

### Backend
- Validação de tipos e tamanhos
- Rate limiting
- CORS configurado
- Helmet para headers de segurança
- Validação de schemas com Joi/Zod

## Testes (Futuro)

### Frontend
```typescript
// Unit tests com Vitest
describe('validateFile', () => {
  it('should validate Excel files', () => {
    const file = new File([''], 'test.xlsx');
    expect(validateFile(file).valid).toBe(true);
  });
});

// Component tests com Testing Library
test('renders UploadPage', () => {
  render(<UploadPage onSuccess={jest.fn()} />);
  expect(screen.getByText('Enviar Planilha')).toBeInTheDocument();
});
```

### Backend
```typescript
// Integration tests com Jest + Supertest
describe('POST /api/excel/process', () => {
  it('should process Excel file', async () => {
    const response = await request(app)
      .post('/api/excel/process')
      .attach('file', 'test.xlsx');

    expect(response.status).toBe(200);
  });
});
```

## Deploy

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy pasta dist/
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
npm run build
npm start
```

### Variáveis de Ambiente

**Desenvolvimento:**
```env
VITE_API_URL=http://localhost:5001
```

**Produção:**
```env
VITE_API_URL=https://api.boraentregar.com
```

## Melhorias Futuras

### Curto Prazo
- [ ] Adicionar loading skeletons
- [ ] Implementar error boundaries
- [ ] Adicionar testes unitários
- [ ] Melhorar acessibilidade (a11y)

### Médio Prazo
- [ ] Autenticação com JWT
- [ ] Sistema de permissões
- [ ] PWA (Progressive Web App)
- [ ] Notificações push

### Longo Prazo
- [ ] Microserviços
- [ ] GraphQL
- [ ] Real-time com WebSockets
- [ ] Machine Learning para otimização

## Conclusão

Esta arquitetura foi projetada para ser:
- **Escalável**: Fácil adicionar novos recursos
- **Manutenível**: Código organizado e documentado
- **Testável**: Componentes isolados e funções puras
- **Performático**: Otimizações e boas práticas
- **Seguro**: Validações e proteções em múltiplas camadas

O código está pronto para crescer conforme as necessidades do projeto evoluem.
