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
import { NewsUserService } from './services/news-user.service';
import { NewsController } from './controllers/news.controller';
import { NewsUser } from '../entities/news-user.entity';
import { UploadController } from './controllers/upload.controller';
import { ImagesController } from './controllers/image.controller';
import { LocalUploadService } from './services/local-upload.service';
import { UserEmailMessage } from '../entities/user-email-message.entity';
import { UsersEmailsService } from './services/users-emails.service';
import { UsersEmailsController } from './controllers/users-emails.controller';
import { UsersModule } from '../users/users.module'; 
@Module({
  imports: [
    TypeOrmModule.forFeature([      
        MenuTable,
        MenuPost,
        MenuButton,
        GreetingBot,
        MenuPostButton,
        NewsUser,
        UserEmailMessage
    ]),UsersModule
  ],
  controllers: [
    ApiController,
    GreetingController,
    MenuPostController, 
    MenuTableController, 
    MenuPostButtonsController,
    MenuButtonInlineController,
    NewsController,
    UploadController,
    ImagesController, 
    UsersEmailsController
    ], // Регистрируем контроллер
  providers: [
    ApiService,
    GreetingBotService, 
    MenuPostService,
    MenuTableService,
    MenuPostButtonsService,
    MenuButtonInlineService,
    NewsUserService,
    LocalUploadService,
    UsersEmailsService
      ], // Регистрируем сервис
  exports: [ApiService], // Экспортируем сервис, если потребуется в других модулях
})
export class ApiModule {}