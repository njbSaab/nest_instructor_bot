import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { LocalUploadService } from '../services/local-upload.service';
import { getPublicPath } from '../../../config';

@Controller('upload')
export class UploadController {
  constructor(private readonly localUploadService: LocalUploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Временная папка
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `image-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const targetPath = join(getPublicPath(), 'images', file.filename); // Используем getPublicPath()
    await this.localUploadService.uploadFile(file.path, targetPath);
    return { success: true, path: `/images/${file.filename}` };
  }
}