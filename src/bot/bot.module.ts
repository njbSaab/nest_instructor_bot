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
import { PushNotificationService } from './services/push-notification.service';
import { PushNotificationController } from './controllers/push-notification.controller';
import { NewsCategory } from '../entities/news-category.entity';
import { UserNewsCategoryService } from './services/user-news-category.service';
import { User } from '../entities/user.entity';
import { NewsCategoryController } from './controllers/ news-category.controller';
import { TextMessageHandler } from './handlers/text-message.handler';

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
      NewsCategory,
      User
          ]),
    UsersModule,
  ],
  controllers: [
    MenuController, 
    PushNotificationController,
    NewsCategoryController
  ],
  providers: [
    BotService,
    MenuService,
    GreetingBotService,
    UserSportsService,
    UserNewsService,
    PushNotificationService,
    UserNewsCategoryService,
    TextMessageHandler
      ],
  exports: [GreetingBotService], // Экспортируем, если используется в других модулях
})
export class BotModule {}