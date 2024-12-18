import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class PromoService {
    async sendPromoMenu(ctx: Context) {
        await ctx.reply('🎁 Выберите вариант промо:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎰 Ставки на спорт', callback_data: 'promo_sport' }],
              [{ text: '🎲 Онлайн казино', callback_data: 'promo_casino' }],
              [
                { text: '🎟️ Free Spin', callback_data: 'promo_freespin' },
                { text: '🎁 Free Bet', callback_data: 'promo_freebet' },
              ],
            ],
          },
        });
      }
    
      async handleCallbackQuery(ctx: Context) {
        const action = ctx.callbackQuery['data'];
    
        switch (action) {
          case 'promo_sport':
            await ctx.reply('🎰 Вы выбрали "Ставки на спорт".');
            break;
          case 'promo_casino':
            await ctx.reply('🎲 Вы выбрали "Онлайн казино".');
            break;
          case 'promo_freespin':
            await ctx.reply('🎟️ Вы получили Free Spin!');
            break;
          case 'promo_freebet':
            await ctx.reply('🎁 Вы получили Free Bet!');
            break;
          default:
            await ctx.reply('❌ Неизвестная команда.');
        }
      }
}
