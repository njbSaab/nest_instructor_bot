import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BotService } from './services/bot.service';
import { PromoService } from './services/promo/promo.service';
import { StartService } from './services/start/start.service';
import { HelpService } from './services/help/help.service';
import { MessageService } from './services/message/message.service';
import { PaymentService } from './services/payment/payment.service';
import { KeyboardService } from './services/keyboard/keyboard.service';

import { User } from './entities/user.entity';
import { MenuButton } from './entities/menu-button.entity';
import { MenuButtonController } from './controllers/menu-button.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TEL_TOKEN'),
      }),
    }),
    TypeOrmModule.forFeature([User, MenuButton]), // Подключаем сущности
  ],
  controllers: [
    MenuButtonController, // Регистрация контроллера
  ],
  providers: [
    BotService,
    PromoService,
    StartService,
    HelpService,
    MessageService,
    PaymentService,
    KeyboardService,
  ],
})
export class BotModule {}