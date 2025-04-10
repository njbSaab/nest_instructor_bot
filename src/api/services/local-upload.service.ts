// src/api/services/local-upload.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class LocalUploadService {
  private readonly logger = new Logger(LocalUploadService.name);

  /**
   * Перемещает файл из localPath в targetPath.
   * targetPath — абсолютный путь к файлу, например, "./public/images/filename.png".
   */
  async uploadFile(localPath: string, targetPath: string): Promise<void> {
    try {
      // Создаем целевую директорию, если её нет
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });
      
      // Перемещаем (переименовываем) файл
      await fs.rename(localPath, targetPath);
      this.logger.log(`Файл успешно перемещен в ${targetPath}`);
    } catch (error) {
      this.logger.error('Ошибка при перемещении файла', error);
      throw error;
    }
  }
}