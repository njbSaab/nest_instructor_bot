import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включение CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Укажите разрешенный источник
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешенные HTTP-методы
    credentials: true, // Если требуется отправка cookies
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();