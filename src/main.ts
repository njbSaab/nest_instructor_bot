import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://delicate-elf-1d7e34.netlify.app', // Разрешить ваш Netlify-домен
      'http://localhost:4200',
      'https://harmonious-starburst-a54901.netlify.app' // (опционально) локальная разработка
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Если нужно передавать куки
  });

  await app.listen(3000);
}
bootstrap();