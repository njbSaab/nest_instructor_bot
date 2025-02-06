import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuTable } from '../entities/menu-tables.entity';
import { MenuPost } from '../entities/menu-posts.entity';
import { MenuButton } from '../entities/menu-button.entity';
import { ApiService } from './services/api.service';
import { ApiController } from './controllers/api.controller';
import { GreetingBot } from '../entities/greeting-bot.entity';
import { MenuPostButton } from '../entities/menu-post-button.entity';
import { GreetingController } from './controllers/greeting.controller';
import { GreetingBotService } from './services/greeting-bot.service';
import { MenuPostController } from './controllers/menu-post.controller';
import { MenuPostService } from './services/menu-post.service';
import { MenuTableService } from './services/tables-menu.service';
import { MenuTableController } from './controllers/tables-menu.controller';
import { MenuPostButtonsService } from './services/menu-post-buttons.service';
import { MenuPostButtonsController } from './controllers/menu-post-buttons.controller';
import { MenuButtonInlineService } from './services/menu-buttons-inline.service';
import { MenuButtonInlineController } from './controllers/menu-buttons-inline.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([      
        MenuTable,
        MenuPost,
        MenuButton,
        GreetingBot,
        MenuPostButton
    ]), // Импортируем сущности
  ],
  controllers: [
    ApiController,
    GreetingController,
    MenuPostController, 
    MenuTableController, 
    MenuPostButtonsController,
    MenuButtonInlineController
    ], // Регистрируем контроллер
  providers: [
    ApiService,
    GreetingBotService, 
    MenuPostService,
    MenuTableService,
    MenuPostButtonsService,
    MenuButtonInlineService
      ], // Регистрируем сервис
  exports: [ApiService], // Экспортируем сервис, если потребуется в других модулях
})
export class ApiModule {}