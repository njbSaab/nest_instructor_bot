import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Делаем переменные доступными во всех модулях
  }), BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


