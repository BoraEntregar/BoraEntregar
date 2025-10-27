import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { excelService } from '../services/api';
import { MESSAGES } from '../constants';

/**
 * Hook para verificar saúde da API
 */
export const useApiHealth = () => {
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        await excelService.healthCheck();
      } catch (error) {
        toast.error(MESSAGES.ERROR.API_CONNECTION);
      }
    };

    checkApiHealth();
  }, []);
};
