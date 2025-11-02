import fs from 'fs';
import path from 'path';

/**
 * Utilitário para gerenciar armazenamento de arquivos processados na VPS
 * Estrutura: uploads/processed/{userId}/{ano-mes-dia}/{timestamp}_{nome}.xlsx
 */
export class FileStorage {
  private static UPLOAD_BASE = path.join(process.cwd(), 'uploads', 'processed');

  /**
   * Sanitiza o userId removendo caracteres especiais
   */
  private static sanitizeUserId(userId: string): string {
    return userId.replace(/[^a-z0-9_-]/gi, '_');
  }

  /**
   * Gera o caminho da pasta de data no formato YYYY-MM-DD
   */
  private static getDateFolder(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Garante que a estrutura de diretórios existe
   * uploads/processed/{userId}/{YYYY-MM-DD}/
   */
  static ensureUserDateDir(userId: string): string {
    const sanitizedUserId = this.sanitizeUserId(userId);
    const dateFolder = this.getDateFolder();
    const userDateDir = path.join(this.UPLOAD_BASE, sanitizedUserId, dateFolder);

    if (!fs.existsSync(userDateDir)) {
      fs.mkdirSync(userDateDir, { recursive: true });
    }

    return userDateDir;
  }

  /**
   * Gera um nome de arquivo único baseado no timestamp
   */
  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '_');
    return `${timestamp}_${baseName}${ext}`;
  }

  /**
   * Salva um buffer de arquivo no disco
   * Retorna o caminho relativo do arquivo salvo
   */
  static async saveFile(userId: string, originalName: string, buffer: Buffer): Promise<string> {
    const userDateDir = this.ensureUserDateDir(userId);
    const fileName = this.generateFileName(originalName);
    const absolutePath = path.join(userDateDir, fileName);

    await fs.promises.writeFile(absolutePath, buffer);

    // Retorna caminho relativo (para salvar no MongoDB)
    const sanitizedUserId = this.sanitizeUserId(userId);
    const dateFolder = this.getDateFolder();
    return path.join('uploads', 'processed', sanitizedUserId, dateFolder, fileName);
  }

  /**
   * Lê um arquivo do disco
   */
  static async readFile(relativePath: string): Promise<Buffer> {
    const absolutePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error('Arquivo não encontrado');
    }

    return await fs.promises.readFile(absolutePath);
  }

  /**
   * Deleta um arquivo do disco
   */
  static async deleteFile(relativePath: string): Promise<void> {
    const absolutePath = path.join(process.cwd(), relativePath);

    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  static fileExists(relativePath: string): boolean {
    const absolutePath = path.join(process.cwd(), relativePath);
    return fs.existsSync(absolutePath);
  }

  /**
   * Retorna o caminho absoluto de um arquivo
   */
  static getAbsolutePath(relativePath: string): string {
    return path.join(process.cwd(), relativePath);
  }

  /**
   * Retorna informações sobre o arquivo
   */
  static async getFileInfo(relativePath: string): Promise<{ size: number; createdAt: Date }> {
    const absolutePath = path.join(process.cwd(), relativePath);
    const stats = await fs.promises.stat(absolutePath);

    return {
      size: stats.size,
      createdAt: stats.birthtime
    };
  }

  /**
   * Lista todos os arquivos de um usuário
   */
  static async listUserFiles(userId: string): Promise<string[]> {
    const sanitizedUserId = this.sanitizeUserId(userId);
    const userDir = path.join(this.UPLOAD_BASE, sanitizedUserId);

    if (!fs.existsSync(userDir)) {
      return [];
    }

    const files: string[] = [];
    const dateFolders = await fs.promises.readdir(userDir);

    for (const dateFolder of dateFolders) {
      const dateFolderPath = path.join(userDir, dateFolder);
      const stat = await fs.promises.stat(dateFolderPath);

      if (stat.isDirectory()) {
        const filesInDate = await fs.promises.readdir(dateFolderPath);
        for (const file of filesInDate) {
          files.push(path.join('uploads', 'processed', sanitizedUserId, dateFolder, file));
        }
      }
    }

    return files;
  }

  /**
   * Deleta todos os arquivos de um usuário em uma data específica
   */
  static async deleteUserDateFolder(userId: string, dateFolder: string): Promise<void> {
    const sanitizedUserId = this.sanitizeUserId(userId);
    const dateFolderPath = path.join(this.UPLOAD_BASE, sanitizedUserId, dateFolder);

    if (fs.existsSync(dateFolderPath)) {
      await fs.promises.rm(dateFolderPath, { recursive: true, force: true });
    }
  }

  /**
   * Retorna o tamanho total dos arquivos de um usuário em bytes
   */
  static async getUserStorageSize(userId: string): Promise<number> {
    const files = await this.listUserFiles(userId);
    let totalSize = 0;

    for (const file of files) {
      try {
        const info = await this.getFileInfo(file);
        totalSize += info.size;
      } catch (error) {
        // Arquivo pode ter sido deletado entre a listagem e a consulta
        continue;
      }
    }

    return totalSize;
  }

  /**
   * Deleta arquivos mais antigos que X dias
   */
  static async cleanupOldFiles(daysOld: number = 30): Promise<{ deletedFiles: number; freedSpace: number }> {
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000; // Converte dias para ms
    let deletedFiles = 0;
    let freedSpace = 0;

    if (!fs.existsSync(this.UPLOAD_BASE)) {
      return { deletedFiles: 0, freedSpace: 0 };
    }

    const userFolders = await fs.promises.readdir(this.UPLOAD_BASE);

    for (const userFolder of userFolders) {
      const userPath = path.join(this.UPLOAD_BASE, userFolder);
      const userStat = await fs.promises.stat(userPath);

      if (!userStat.isDirectory()) continue;

      const dateFolders = await fs.promises.readdir(userPath);

      for (const dateFolder of dateFolders) {
        const datePath = path.join(userPath, dateFolder);
        const dateStat = await fs.promises.stat(datePath);

        if (!dateStat.isDirectory()) continue;

        const files = await fs.promises.readdir(datePath);

        for (const file of files) {
          const filePath = path.join(datePath, file);
          const fileStat = await fs.promises.stat(filePath);

          // Verifica se o arquivo é mais antigo que o limite
          if (now - fileStat.mtimeMs > maxAge) {
            freedSpace += fileStat.size;
            await fs.promises.unlink(filePath);
            deletedFiles++;
          }
        }

        // Remove pasta de data se estiver vazia
        const remainingFiles = await fs.promises.readdir(datePath);
        if (remainingFiles.length === 0) {
          await fs.promises.rmdir(datePath);
        }
      }

      // Remove pasta do usuário se estiver vazia
      const remainingDateFolders = await fs.promises.readdir(userPath);
      if (remainingDateFolders.length === 0) {
        await fs.promises.rmdir(userPath);
      }
    }

    return { deletedFiles, freedSpace };
  }
}
