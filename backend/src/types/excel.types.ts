// Interface para representar uma linha do Excel
export interface ExcelRow {
  sequence: string;
  destinationAddress: string;
  bairro: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
}

// Interface para dados agrupados
export interface GroupedData {
  sequence: string; // Múltiplas sequências separadas por "; "
  destinationAddress: string;
  bairro: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
}

// Interface para resposta da API
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

// Interface para configuração de processamento
export interface ProcessConfig {
  routeName?: string; // Nome da rota (do comboBox)
  groupByCoordinates?: boolean;
  latitudePrecision?: number; // Quantidade de caracteres para comparar
  longitudePrecision?: number;
}