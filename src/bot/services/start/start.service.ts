import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class StartService {
    async handleStart(ctx: Context) {
        await ctx.reply('👋 Добро пожаловать в InfoForGamesBot!\n\nВыберите раздел из меню:');
        await ctx.reply('📋 Главное меню:', {
          reply_markup: {
            keyboard: [
              [{ text: '📖 Инструкция' }],
              [{ text: '💳 Оплата' }],
              [{ text: '❓ Помощь' }, { text: '🎁 Промо' }],
            ],
            resize_keyboard: true,
          },
        });
    }
}
