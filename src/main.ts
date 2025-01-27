import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  config();
  console.log('[NestApplication] Инициализация приложения...');
  
app.enableCors({
  origin: [
    'http://localhost:4200',
    'https://astonishing-biscochitos-1d05c8.netlify.app',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

  const PORT = process.env.PORT || 3000;
  console.log('PORT from env:', process.env.PORT);
  
  try {
    await app.listen(PORT);
    console.log(`[NestApplication] Приложение запущено на http://localhost:${PORT}`);
  } catch (error) {
    console.error('[NestApplication] Ошибка при запуске приложения:', error);
  }
}
bootstrap();