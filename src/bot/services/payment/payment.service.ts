import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class PaymentService {
  async sendPaymentMenu(ctx: Context) {
    // Отправка меню оплаты
    await ctx.reply('💳 Выберите способ оплаты:', {
      reply_markup: {
        keyboard: [
          [{ text: '🏦 Оплата на счёт' }],
          [{ text: '💵 Оплата наличными' }],
          [{ text: '🔙 Назад' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }

  async handlePaymentMenu(ctx: Context, text: string) {
    switch (text) {
      case '🏦 Оплата на счёт':
        await ctx.reply('🏦 Реквизиты для оплаты на счёт:\nСчёт: 123456789\nБанк: ABC Bank');
        break;

      case '💵 Оплата наличными':
        await ctx.reply('💵 Оплата наличными доступна при встрече.');
        break;

      case '🔙 Назад':
        await ctx.reply('🔙 Возвращаемся в главное меню.');
        await this.sendMainMenu(ctx); // Возвращаем главное меню
        break;

      default:
        await ctx.reply('❌ Неизвестная команда в разделе "Оплата".');
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