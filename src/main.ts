import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs'; // Добавляем импорт fs
import { config } from 'dotenv';
import { getPublicPath } from '../config';

// Загружаем .env файл из корня проекта
config({ path: path.resolve(__dirname, '..', '..', '.env') }); // Поднимаемся на два уровня вверх от dist/src

async function bootstrap() {
  console.log('[NestApplication] Инициализация приложения...');

  // Опции HTTPS с указанием сертификата и ключа
  // const httpsOptions = {
  //   key: fs.readFileSync('/etc/letsencrypt/live/top4winners.top/privkey.pem'),
  //   cert: fs.readFileSync('/etc/letsencrypt/live/top4winners.top/fullchain.pem'),
  // };

  // Создаем приложение с httpsOptions
  // const app = await NestFactory.create<NestExpressApplication>(AppModule, { httpsOptions });
  
  // Если вы используете HTTP, просто создайте приложение без httpsOptions
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const allowedOrigins = [
    'http://localhost:4200',
    'https://1xjet-admin.netlify.app',
    'https://1xjet-admin.netlify.app/admin',
    'http://194.36.179.168:4200/admin',
    'http://194.36.179.168:4200',
    'https://1xjet.jp/tgadmin/',
    'https://1xjet.jp/tgadmin',
    'https://1xjet.jp/tgadmin/admin',
    'https://1xjet.jp/tgadmin/admin/',
    'https://1xjet.jp',
    'https://1xjet.jp/',
    'http://185.39.31.103',
    'https://top4winners.top',
    'https://www.top4winners.top',
    'https://stunning-cobbler-a70169.netlify.app'
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Если origin отсутствует (например, для curl-запросов), разрешаем запрос
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const publicPath = getPublicPath();
  app.useStaticAssets(path.join(publicPath, 'images'), {
    prefix: '/images/'
  });

  const PORT = process.env.PORT || 443;
  console.log('PORT from env:', process.env.PORT);
  
  try {
    // Биндимся на все интерфейсы, чтобы приложение было доступно извне
    await app.listen(PORT, '0.0.0.0');
    console.log(`[NestApplication] Приложение запущено на https://localhost:${PORT}`);
  } catch (error) {
    console.error('[NestApplication] Ошибка при запуске приложения:', error);
  }
}

bootstrap();