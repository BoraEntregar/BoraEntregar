import axios from 'axios';
import type {
  ProcessExcelResponse,
  HistoryResponse,
  DetailResponse,
} from '../types';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Cria uma instância do axios com autenticação
 */
export const createAuthenticatedApi = (getAccessToken: () => Promise<string>) => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para adicionar token de autenticação
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Erro ao obter token de acesso:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para tratamento de erros
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = error.response?.data?.message || 'Erro ao comunicar com o servidor';

      // Se erro 401, o usuário não está autenticado
      if (error.response?.status === 401) {
        console.error('Usuário não autenticado. Faça login novamente.');
      }

      return Promise.reject(new Error(errorMessage));
    }
  );

  return {
    /**
     * Upload e processa arquivo Excel
     */
    async processExcel(file: File, routeName: string): Promise<ProcessExcelResponse> {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('routeName', routeName);

      const response = await api.post<ProcessExcelResponse>('/api/excel/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },

    /**
     * Exporta dados processados para Excel
     */
    async exportExcel(processedDataId: string): Promise<Blob> {
      const response = await api.post(
        '/api/excel/export',
        { processedDataId },
        {
          responseType: 'blob',
        }
      );

      return response.data;
    },

    /**
     * Lista histórico de processamentos
     */
    async getHistory(page: number = 1, limit: number = 10): Promise<HistoryResponse> {
      const response = await api.get<HistoryResponse>('/api/excel/history', {
        params: { page, limit },
      });

      return response.data;
    },

    /**
     * Obtém detalhes de um processamento específico
     */
    async getById(id: string): Promise<DetailResponse> {
      const response = await api.get<DetailResponse>(`/api/excel/history/${id}`);
      return response.data;
    },

    /**
     * Remove um processamento do histórico
     */
    async deleteById(id: string): Promise<{ success: boolean; message: string }> {
      const response = await api.delete(`/api/excel/history/${id}`);
      return response.data;
    },

    /**
     * Verifica saúde da API
     */
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
      const response = await api.get('/health');
      return response.data;
    },
  };
};
