import { Router } from 'express';
import { ExcelController } from '../controllers/excelController';
import { upload } from '../middleware/upload';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/excel/process
 * @desc    Processa arquivo Excel e agrupa dados
 * @access  Private (requires authentication)
 */
router.post('/process', requireAuth, upload.single('file'), ExcelController.processExcel);

/**
 * @route   POST /api/excel/export
 * @desc    Exporta dados processados em formato Excel
 * @access  Private (requires authentication)
 */
router.post('/export', requireAuth, ExcelController.exportExcel);

/**
 * @route   GET /api/excel/history
 * @desc    Lista histórico de processamentos
 * @access  Private (requires authentication)
 */
router.get('/history', requireAuth, ExcelController.getHistory);

/**
 * @route   GET /api/excel/history/:id
 * @desc    Busca processamento específico por ID
 * @access  Private (requires authentication)
 */
router.get('/history/:id', requireAuth, ExcelController.getById);

/**
 * @route   DELETE /api/excel/history/:id
 * @desc    Deleta processamento por ID
 * @access  Private (requires authentication)
 */
router.delete('/history/:id', requireAuth, ExcelController.deleteById);

export default router;