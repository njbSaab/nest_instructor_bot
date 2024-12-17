import { Injectable } from '@nestjs/common';
import { Start, Help, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Injectable()
@Update()
export class BotService {
  // Обработка команды /start
  @Start()
  async onStart(ctx: Context) {
    await ctx.reply(
      '👋 Добро пожаловать в InfoForGamesBot!\n\nВыберите раздел из меню:'
    );
    this.sendMainMenu(ctx);
  }

  // Обработка команды /help
  @Help()
  async onHelp(ctx: Context) {
    await ctx.reply(
      'ℹ️ Доступные команды:\n/start - Начать\n/help - Помощь\n\nОтправьте любой текст, и я отвечу вам.'
    );
  }

  // Обработка текстовых сообщений
  @On('text')
  async onText(ctx: Context) {
    const text = ctx.message['text'];

    switch (text) {
      case '📖 Инструкция':
        await ctx.reply('📖 Это раздел "Инструкция". Здесь lorem ipsum...');
        break;

      case '💳 Оплата':
        await this.sendPaymentMenu(ctx);
        break;

      case '🏦 Оплата на счёт':
        await ctx.reply('🏦 Реквизиты для оплаты на счёт:\n\nСчёт: 123456789\nБанк: ABC Bank');
        break;

      case '💵 Оплата наличными':
        await ctx.reply('💵 Оплата наличными доступна при встрече с менеджером.');
        break;

      case '❓ Помощь':
        await ctx.reply('❓ Раздел "Помощь": Пишите в поддержку.');
        break;

      case '🎁 Промо':
        await ctx.reply('🎁 Раздел "Промо": Выберите один из вариантов:');
        await this.sendPromoMenu(ctx);
        break;

      case '🎰 Ставки на спорт':
        await ctx.reply('🎰 Вы выбрали "Ставки на спорт". Здесь можно сделать ставки!');
        break;

      case '🎲 Онлайн казино':
        await ctx.reply('🎲 Вы выбрали "Онлайн казино". Испытайте удачу!');
        break;

      case '🎟️ Free Spin':
        await ctx.reply('🎟️ Вы получили Free Spin! Удачи!');
        break;

      case '🎁 Free Bet':
        await ctx.reply('🎁 Вы получили Free Bet! Наслаждайтесь игрой!');
        break;

      case '🔙 Назад':
        await this.sendMainMenu(ctx);
        break;

      default:
        await ctx.reply('❌ Я не понял, попробуйте выбрать команду из меню.');
        break;
    }
  }

  // Метод для отправки главного меню с кнопками
  private async sendMainMenu(ctx: Context) {
    await ctx.sendMessage('📋 Главное меню:', {
      reply_markup: {
        keyboard: [
          [{ text: '📖 Инструкция' }], 
          [{ text: '💳 Оплата' }],
          [{ text: '❓ Помощь' }, { text: '🎁 Промо' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }
  // Подменю для "Оплата" с кнопками
  private async sendPaymentMenu(ctx: Context) {
    await ctx.sendMessage('💳 Выберите способ оплаты:', {
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

  // Подменю для "Промо" с кнопками
  private async sendPromoMenu(ctx: Context) {
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
  @On('callback_query')
        async onCallbackQuery(ctx: Context) {
        const action = ctx.callbackQuery['data'];
        switch (action) {
            case 'promo_sport':
            await ctx.reply('🎰 Вы выбрали "Ставки на спорт". Здесь можно сделать ставки!');
            break;
            case 'promo_casino':
            await ctx.reply('🎲 Вы выбрали "Онлайн казино". Испытайте удачу!');
            break;
            case 'promo_freespin':
            await ctx.reply('🎟️ Вы получили Free Spin! Удачи!');
            break;
            case 'promo_freebet':
            await ctx.reply('🎁 Вы получили Free Bet! Наслаждайтесь игрой!');
            break;
            default:
            await ctx.reply('❌ Неизвестная команда.');
            break;
        }
    }

}