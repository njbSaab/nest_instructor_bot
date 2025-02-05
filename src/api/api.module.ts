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
  controllers: [ApiController, GreetingController,MenuPostController], // Регистрируем контроллер
  providers: [ApiService, GreetingBotService, MenuPostService], // Регистрируем сервис
  exports: [ApiService], // Экспортируем сервис, если потребуется в других модулях
})
export class ApiModule {}