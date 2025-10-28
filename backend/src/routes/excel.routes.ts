import { Router } from 'express';
import { ExcelController } from '../controllers/excelController';
import { upload } from '../middleware/upload';
import { validateAccessToken, requireAuth, extractUserId } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/excel/process
 * @desc    Processa arquivo Excel e agrupa dados
 * @access  Private (requires authentication)
 */
router.post('/process', validateAccessToken, requireAuth, extractUserId, upload.single('file'), ExcelController.processExcel);

/**
 * @route   POST /api/excel/export
 * @desc    Exporta dados processados em formato Excel
 * @access  Private (requires authentication)
 */
router.post('/export', validateAccessToken, requireAuth, extractUserId, ExcelController.exportExcel);

/**
 * @route   GET /api/excel/history
 * @desc    Lista histórico de processamentos
 * @access  Private (requires authentication)
 */
router.get('/history', validateAccessToken, requireAuth, extractUserId, ExcelController.getHistory);

/**
 * @route   GET /api/excel/history/:id
 * @desc    Busca processamento específico por ID
 * @access  Private (requires authentication)
 */
router.get('/history/:id', validateAccessToken, requireAuth, extractUserId, ExcelController.getById);

/**
 * @route   DELETE /api/excel/history/:id
 * @desc    Deleta processamento por ID
 * @access  Private (requires authentication)
 */
router.delete('/history/:id', validateAccessToken, requireAuth, extractUserId, ExcelController.deleteById);

export default router;