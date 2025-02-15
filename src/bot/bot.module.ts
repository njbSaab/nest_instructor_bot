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
import { UserSports } from '../entities/users-sport.entity';
import { NewsUser } from '../entities/news-user.entity';
import { UserSportsService } from './services/user-sports.service';
import { UserNewsService } from './services/user-news.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Глобальная конфигурация
    TypeOrmModule.forFeature([
      MenuTable,
       MenuButton,
        MenuPost,
         GreetingBot,
          MenuPostButton,
           UserSports,
            NewsUser,
          ]), // Подключение сущностей
    UsersModule,
  ],
  controllers: [MenuController],
  providers: [
    BotService,
     MenuService,
      GreetingBotService,
       UserSportsService,
        UserNewsService
      ],
  exports: [GreetingBotService], // Экспортируем, если используется в других модулях
})
export class BotModule {}