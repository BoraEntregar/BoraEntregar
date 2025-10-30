// Tipos para dados do Excel
export interface ExcelRow {
  sequence: string;
  packageCode: string;
  destinationAddress: string;
  bairro?: string;
  city?: string;
  zipcode?: string;
  latitude: string;
  longitude: string;
}

// Tipos para dados agrupados
export interface GroupedData {
  sequence: string;
  packageCode: string;
  destinationAddress: string;
  bairro?: string;
  city?: string;
  zipcode?: string;
  latitude: string;
  longitude: string;
}

// Resposta da API de processamento
export interface ProcessExcelResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    routeName: string;
    originalFileName: string;
    totalRows: number;
    groupedRows: number;
    data: GroupedData[];
    processedAt: string;
  };
}

// Resposta da API de histórico
export interface HistoryItem {
  _id: string;
  routeName: string;
  originalFileName: string;
  totalRows: number;
  groupedRows: number;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Resposta da API de detalhes
export interface ProcessedDataDetail {
  _id: string;
  routeName: string;
  originalFileName: string;
  totalRows: number;
  groupedRows: number;
  data: GroupedData[];
  processedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailResponse {
  success: boolean;
  data: ProcessedDataDetail;
}

// Resposta genérica de erro
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}
