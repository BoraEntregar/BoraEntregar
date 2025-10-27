import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../constants';

/**
 * Valida se o arquivo é um Excel válido
 */
export const isValidExcelFile = (file: File): boolean => {
  // Validar por extensão (case insensitive)
  const hasValidExtension = /\.(xlsx|xls)$/i.test(file.name);

  // Validar por MIME type
  const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.type);

  return hasValidExtension || hasValidMimeType;
};

/**
 * Valida o tamanho do arquivo
 */
export const isValidFileSize = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Formata o tamanho do arquivo em KB
 */
export const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(2)} KB`;
};

/**
 * Valida arquivo completo (tipo e tamanho)
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!isValidExcelFile(file)) {
    return {
      valid: false,
      error: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
    };
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: 'O arquivo não pode ter mais de 10MB',
    };
  }

  return { valid: true };
};
