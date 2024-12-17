import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { BotService } from './services/bot.service';
import { PromoService } from './services/promo/promo.service';
import { StartService } from './services/start/start.service';
import { HelpService } from './services/help/help.service';
import { MessageService } from './services/message/message.service';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TEL_TOKEN'), // Получаем токен из .env
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotService, PromoService, StartService, HelpService, MessageService],
})
export class BotModule {}