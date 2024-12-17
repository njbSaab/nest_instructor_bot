import { Injectable } from '@nestjs/common';
import { Start, Help, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { StartService } from './start/start.service';
import { HelpService } from './help/help.service';
import { MessageService } from './message/message.service';
import { PromoService } from './promo/promo.service';

@Injectable()
@Update()
export class BotService {
  constructor(
    private readonly startService: StartService,
    private readonly helpService: HelpService,
    private readonly messageService: MessageService,
    private readonly promoService: PromoService,
  ) {}

  @Start()
  async onStart(ctx: Context) {
    await this.startService.handleStart(ctx);
  }

  @Help()
  async onHelp(ctx: Context) {
    await this.helpService.handleHelp(ctx);
  }

  @On('text')
  async onText(ctx: Context) {
    await this.messageService.handleText(ctx);
  }

  @On('callback_query')
  async onCallbackQuery(ctx: Context) {
    await this.promoService.handleCallbackQuery(ctx);
  }
}