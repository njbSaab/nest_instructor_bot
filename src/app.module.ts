import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '103.195.5.13', // Ваш хост
      port: 3306,           // Порт MySQL
      username: 'myuser',   // Логин
      password: 'mypassword', // Пароль
      database: 'mydatabase', // Название базы данных
      entities: [__dirname + '/**/*.entity.{js,ts}'], // Пути к сущностям
      synchronize: false,   // Синхронизация схемы (поставьте false для production)
    }),
    BotModule, // Ваш модуль с логикой бота
  ],
})
export class AppModule {}