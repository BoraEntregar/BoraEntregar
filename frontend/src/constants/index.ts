// App Constants
export const APP_NAME = 'BoraEntregar';
export const APP_VERSION = 'v1.0';
export const APP_DESCRIPTION = 'Sistema de Agrupamento de Rotas de Entrega';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// File Upload Configuration
export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
export const ALLOWED_FILE_TYPES = ['.xlsx', '.xls'];
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

// Pagination
export const ITEMS_PER_PAGE = 10;

// Toast Configuration
export const TOAST_DURATION = 4000;

// Messages
export const MESSAGES = {
  SUCCESS: {
    FILE_UPLOADED: 'Arquivo processado com sucesso!',
    FILE_SELECTED: 'Arquivo selecionado',
    FILE_EXPORTED: 'Arquivo exportado com sucesso!',
    RECORD_DELETED: 'Registro excluído com sucesso',
  },
  ERROR: {
    API_CONNECTION: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
    INVALID_FILE_TYPE: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
    FILE_TOO_LARGE: 'O arquivo não pode ter mais de 10MB',
    NO_FILE_SELECTED: 'Por favor, selecione um arquivo',
    NO_ROUTE_NAME: 'Por favor, informe o nome da rota',
    PROCESSING_ERROR: 'Erro ao processar arquivo',
    EXPORT_ERROR: 'Erro ao exportar arquivo',
    LOAD_HISTORY_ERROR: 'Erro ao carregar histórico',
    LOAD_DETAILS_ERROR: 'Erro ao carregar detalhes',
    DELETE_ERROR: 'Erro ao excluir registro',
    EXPORT_LOCAL_ERROR: 'Erro ao exportar arquivo localmente',
  },
  CONFIRM: {
    DELETE: (routeName: string) => `Tem certeza que deseja excluir "${routeName}"?`,
  },
};

// View Types
export type ViewType = 'home' | 'upload' | 'results' | 'history' | 'profile';

// Routes
export const VIEWS = {
  HOME: 'home' as ViewType,
  UPLOAD: 'upload' as ViewType,
  RESULTS: 'results' as ViewType,
  HISTORY: 'history' as ViewType,
  PROFILE: 'profile' as ViewType,
};
