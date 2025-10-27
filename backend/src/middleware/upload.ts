import multer from 'multer';
import path from 'path';

// Configuração do multer para armazenar em memória
const storage = multer.memoryStorage();

// Filtro de arquivos - apenas .xlsx e .xls
const fileFilter = (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    callback(null, true);
  } else {
    callback(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
  }
};

// Configuração do multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});