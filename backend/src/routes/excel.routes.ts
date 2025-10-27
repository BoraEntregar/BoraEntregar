import { Router } from 'express';
import { ExcelController } from '../controllers/excelController';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * @route   POST /api/excel/process
 * @desc    Processa arquivo Excel e agrupa dados
 * @access  Public
 */
router.post('/process', upload.single('file'), ExcelController.processExcel);

/**
 * @route   POST /api/excel/export
 * @desc    Exporta dados processados em formato Excel
 * @access  Public
 */
router.post('/export', ExcelController.exportExcel);

/**
 * @route   GET /api/excel/history
 * @desc    Lista histórico de processamentos
 * @access  Public
 */
router.get('/history', ExcelController.getHistory);

/**
 * @route   GET /api/excel/history/:id
 * @desc    Busca processamento específico por ID
 * @access  Public
 */
router.get('/history/:id', ExcelController.getById);

/**
 * @route   DELETE /api/excel/history/:id
 * @desc    Deleta processamento por ID
 * @access  Public
 */
router.delete('/history/:id', ExcelController.deleteById);

export default router;