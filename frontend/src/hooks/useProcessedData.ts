import { useState } from 'react';
import type { ProcessExcelResponse } from '../types';

/**
 * Hook para gerenciar dados processados
 */
export const useProcessedData = () => {
  const [processedData, setProcessedData] = useState<ProcessExcelResponse['data'] | null>(null);

  const updateProcessedData = (data: ProcessExcelResponse['data']) => {
    setProcessedData(data);
  };

  const clearProcessedData = () => {
    setProcessedData(null);
  };

  return {
    processedData,
    updateProcessedData,
    clearProcessedData,
    hasData: processedData !== null,
  };
};
