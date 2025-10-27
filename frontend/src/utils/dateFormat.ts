/**
 * Formata uma data para o formato brasileiro
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formata data para nome de arquivo
 */
export const formatDateForFilename = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0].replace(/-/g, '');
};
