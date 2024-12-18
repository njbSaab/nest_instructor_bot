import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BotService } from './services/bot.service';
import { PromoService } from './services/promo/promo.service';
import { StartService } from './services/start/start.service';
import { HelpService } from './services/help/help.service';
import { MessageService } from './services/message/message.service';
import {PaymentService} from './services/payment/payment.service';
import { User } from './entities/user.entity';
import { MenuButton } from './entities/menu-button.entity';


@Module({
  imports: [
    // Подключаем ConfigModule для работы с .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Настраиваем TelegrafModule с использованием токена из .env
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TEL_TOKEN'), // Получаем токен
      }),
    }),
    // Подключаем TypeORM и сущность User
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([User, MenuButton]), // Подключаем сущности User и MenuButton

  ],
  providers: [
    BotService,
    PromoService,
    StartService,
    HelpService,
    MessageService,
    PaymentService
  ],
})
export class BotModule {}
