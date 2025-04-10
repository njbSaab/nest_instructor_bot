import { Controller, Get } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { getPublicPath } from '../../../config';

@Controller('images')
export class ImagesController {
  @Get()
  async getImages(): Promise<string[]> {
    // Абсолютный путь к папке с изображениями
    const imagesFolder = path.join(getPublicPath(), 'images'); // Убрано лишнее src
    try {
      // Читаем список файлов в папке
      const files = await fs.readdir(imagesFolder);
      // Преобразуем имена файлов в URL
      return files.map(file => `/images/${file}`);
    } catch (error) {
      console.error('Ошибка чтения папки с изображениями', error);
      return [];
    }
  }
}