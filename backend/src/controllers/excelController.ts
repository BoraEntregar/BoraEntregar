import { Request, Response } from 'express';
import { ExcelProcessor } from '../utils/excelProcessor';
import ProcessedData from '../models/ProcessedData';
import { ProcessExcelResponse } from '../types/excel.types';
import { FileStorage } from '../utils/fileStorage';

export class ExcelController {
  
  /**
   * Processa arquivo Excel enviado
   * POST /api/excel/process
   */
  static async processExcel(req: Request, res: Response): Promise<void> {
    try {
      // Verificar se arquivo foi enviado
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      // Extrair userId do request (adicionado pelo middleware extractUserId)
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const { routeName = 'Rota Padrão' } = req.body;
      const originalFileName = req.file.originalname;

      // Ler arquivo Excel
      const excelData = ExcelProcessor.readExcelFile(req.file.buffer);

      // Validar dados
      const validation = ExcelProcessor.validateExcelData(excelData);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.message
        });
        return;
      }

      // Agrupar dados
      const groupedData = ExcelProcessor.groupByCoordinates(excelData);

      // Gerar arquivo Excel processado
      const date = new Date();
      const processedFileName = `${routeName.replace(/[^a-z0-9]/gi, '_')}_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
      const excelBuffer = ExcelProcessor.generateExcelFile(groupedData, processedFileName);

      // Salvar arquivo Excel processado no disco
      const filePath = await FileStorage.saveFile(userId, processedFileName, excelBuffer);

      // Salvar metadados no MongoDB
      const processedRecord = new ProcessedData({
        userId,
        routeName,
        originalFileName,
        totalRows: excelData.length,
        groupedRows: groupedData.length,
        filePath,
        fileSize: excelBuffer.length
      });

      const savedRecord = await processedRecord.save();

      // Resposta de sucesso com todos os dados necessários
      const response: ProcessExcelResponse = {
        success: true,
        message: 'Arquivo processado com sucesso!',
        data: {
          _id: String(savedRecord._id),
          routeName: savedRecord.routeName,
          originalFileName: savedRecord.originalFileName,
          totalRows: savedRecord.totalRows,
          groupedRows: savedRecord.groupedRows,
          data: groupedData,
          processedAt: savedRecord.processedAt.toISOString()
        }
      };

      res.status(200).json(response);
      
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar arquivo',
        error: error.message
      });
    }
  }

  /**
   * Gera e baixa arquivo Excel processado
   * POST /api/excel/export
   */
  static async exportExcel(req: Request, res: Response): Promise<void> {
    try {
      const { processedDataId } = req.body;
      const userId = (req as any).userId;

      if (!processedDataId) {
        res.status(400).json({
          success: false,
          message: 'ID do processamento não fornecido'
        });
        return;
      }

      // Buscar dados processados no MongoDB (filtrado por userId)
      const processedData = await ProcessedData.findOne({
        _id: processedDataId,
        userId
      });

      if (!processedData) {
        res.status(404).json({
          success: false,
          message: 'Dados não encontrados ou você não tem permissão para acessá-los'
        });
        return;
      }

      // Verificar se o arquivo existe no disco
      if (!FileStorage.fileExists(processedData.filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo processado não encontrado no servidor'
        });
        return;
      }

      // Ler arquivo do disco
      const buffer = await FileStorage.readFile(processedData.filePath);

      // Nome do arquivo para download
      const fileName = `${processedData.routeName.replace(/[^a-z0-9]/gi, '_')}_${processedData.originalFileName}`;

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);

    } catch (error: any) {
      console.error('Erro ao exportar arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao exportar arquivo',
        error: error.message
      });
    }
  }

  /**
   * Lista todos os processamentos salvos
   * GET /api/excel/history
   */
  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, page = 1 } = req.query;
      const userId = (req as any).userId;

      const skip = (Number(page) - 1) * Number(limit);

      // Filtrar histórico por userId
      const history = await ProcessedData
        .find({ userId })
        .select('-data') // Não retorna o array de dados completo
        .sort({ processedAt: -1 })
        .limit(Number(limit))
        .skip(skip);

      const total = await ProcessedData.countDocuments({ userId });

      res.status(200).json({
        success: true,
        data: history,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit))
        }
      });
      
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico',
        error: error.message
      });
    }
  }

  /**
   * Busca um processamento específico por ID
   * GET /api/excel/history/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      // Buscar registro apenas se pertencer ao usuário
      const record = await ProcessedData.findOne({
        _id: id,
        userId
      });

      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Registro não encontrado ou você não tem permissão para acessá-lo'
        });
        return;
      }

      // Verificar se o arquivo existe no disco
      if (!FileStorage.fileExists(record.filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo processado não encontrado no servidor'
        });
        return;
      }

      // Ler e processar o arquivo Excel para obter os dados
      const buffer = await FileStorage.readFile(record.filePath);
      const processedData = ExcelProcessor.readExcelFile(buffer);

      res.status(200).json({
        success: true,
        data: {
          _id: String(record._id),
          userId: record.userId,
          routeName: record.routeName,
          originalFileName: record.originalFileName,
          totalRows: record.totalRows,
          groupedRows: record.groupedRows,
          filePath: record.filePath,
          fileSize: record.fileSize,
          processedAt: record.processedAt,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          data: processedData // Dados extraídos do arquivo Excel
        }
      });

    } catch (error: any) {
      console.error('Erro ao buscar registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar registro',
        error: error.message
      });
    }
  }

  /**
   * Faz download direto de um arquivo processado
   * GET /api/excel/download/:id
   */
  static async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      // Buscar registro
      const record = await ProcessedData.findOne({
        _id: id,
        userId
      });

      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado ou você não tem permissão para acessá-lo'
        });
        return;
      }

      // Verificar se o arquivo existe no disco
      if (!FileStorage.fileExists(record.filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado no servidor'
        });
        return;
      }

      // Ler arquivo do disco
      const buffer = await FileStorage.readFile(record.filePath);

      // Nome do arquivo para download
      const fileName = `${record.routeName.replace(/[^a-z0-9]/gi, '_')}_processado.xlsx`;

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);

    } catch (error: any) {
      console.error('Erro ao fazer download do arquivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer download do arquivo',
        error: error.message
      });
    }
  }

  /**
   * Deleta um processamento
   * DELETE /api/excel/history/:id
   */
  static async deleteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      // Buscar e deletar registro apenas se pertencer ao usuário
      const deleted = await ProcessedData.findOneAndDelete({
        _id: id,
        userId
      });

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Registro não encontrado ou você não tem permissão para deletá-lo'
        });
        return;
      }

      // Deletar arquivo do disco
      try {
        await FileStorage.deleteFile(deleted.filePath);
      } catch (error) {
        console.warn('Erro ao deletar arquivo do disco:', error);
        // Continua mesmo se falhar ao deletar o arquivo físico
      }

      res.status(200).json({
        success: true,
        message: 'Registro deletado com sucesso'
      });
      
    } catch (error: any) {
      console.error('Erro ao deletar registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar registro',
        error: error.message
      });
    }
  }
}