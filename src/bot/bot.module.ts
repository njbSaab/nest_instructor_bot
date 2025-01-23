import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotService } from './bot.service';
import { MenuController } from './controllers/menu.controller';
import { MenuService } from './services/menu.service';
import { MenuTable } from '../entities/menu-tables.entity';
import { MenuButton } from '../entities/menu-button.entity';
import { UsersModule } from '../users/users.module';
import { GreetingBotService } from './services/greeting-bot.service';
import { GreetingBot } from '../entities/greeting-bot.entity';
import { MenuPost } from '../entities/menu-posts.entity';
import { MenuPostButton } from '../entities/menu-post-button.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Глобальная конфигурация
    TypeOrmModule.forFeature([MenuTable, MenuButton, MenuPost, GreetingBot, MenuPostButton]), // Подключение сущностей
    UsersModule,
  ],
  controllers: [MenuController],
  providers: [BotService, MenuService, GreetingBotService],
  exports: [GreetingBotService], // Экспортируем, если используется в других модулях
})
export class BotModule {}