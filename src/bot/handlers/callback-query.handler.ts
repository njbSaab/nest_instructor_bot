import { Injectable } from '@nestjs/common';
import { MenuService } from '../services/menu.service';

@Injectable()
export class CallbackQueryHandler {
  constructor(private readonly menuService: MenuService) {}

  async handle(ctx: any) {
    const callbackData = ctx.callbackQuery?.data;

    if (!callbackData) {
      console.log('[CallbackQueryHandler] Callback без данных');
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }

    const buttonId = parseInt(callbackData, 10);
    if (isNaN(buttonId)) {
      console.log('[CallbackQueryHandler] Некорректный buttonId');
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }

    console.log(`[CallbackQueryHandler] Нажата кнопка с ID: ${buttonId}`);
    const post = await this.menuService.getPostByButtonId(buttonId);

    if (post) {
      await ctx.reply(`Переходим к посту ID: ${post.id}`);
    } else {
      const button = await this.menuService.getButtonById(buttonId);
      if (button?.url) {
        await ctx.reply(`Откройте ссылку: ${button.url}`);
      } else {
        await ctx.reply('Действие для кнопки не настроено.');
      }
    }

    await ctx.answerCbQuery();
  }
}