import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { PaymentService } from '../payment/payment.service';
import { PromoService } from '../promo/promo.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly promoService: PromoService,
  ) {}

  async handleText(ctx: Context) {
    const text = ctx.message['text'];

    switch (text) {
      case '📖 Инструкция':
        await ctx.reply('📖 Это раздел "Инструкция". Здесь lorem ipsum...');
        break;

      case '💳 Оплата':
        await this.paymentService.sendPaymentMenu(ctx); // Переход к меню оплаты
        break;

      case '🔙 Назад':
        await ctx.reply('🔙 Возвращаемся в главное меню.');
        await this.sendMainMenu(ctx); // Возвращаем главное меню
        break;

      case '❓ Помощь':
        await ctx.reply('❓ Это раздел "Помощь". Обратитесь в поддержку.');
        break;

      case '🎁 Промо':
        await ctx.reply('🎁 Это раздел "Промо".');
        await this.promoService.sendPromoMenu(ctx); // Переход к промо
        break;

      default:
        await ctx.reply('❌ Неизвестная команда. Выберите раздел из меню.');
    }
  }

  private async sendMainMenu(ctx: Context) {
    // Отправка главного меню
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