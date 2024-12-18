import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuButton } from '../../entities/menu-button.entity';

@Injectable()
export class PromoService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}

  async sendPromoMenu(ctx: Context) {
    console.log('Загружаем дочерние кнопки для Промо...');

    // Ищем кнопки с parent_id = 7 (Промо)
    const promoButtons = await this.menuButtonRepository.find({
      where: { parent_id: 7 },
      order: { row_order: 'ASC', column_order: 'ASC' },
    });

    console.log('Кнопки для Промо:', promoButtons);

    // Разделяем кнопки на inline и keyboard
    const inlineButtons = promoButtons.filter((btn) => btn.is_inline);
    const keyboardButtons = promoButtons.filter((btn) => !btn.is_inline);

    // Формируем inline-клавиатуру
    const inlineKeyboard: { text: string; callback_data: string }[][] = [];
    inlineButtons.forEach((button) => {
      const rowIndex = button.row_order ? button.row_order - 1 : 0; // Индекс строки (0-based)
      if (!inlineKeyboard[rowIndex]) {
        inlineKeyboard[rowIndex] = [];
      }
      inlineKeyboard[rowIndex].push({
        text: button.name,
        callback_data: button.action,
      });
    });

    // Формируем обычную клавиатуру (если нужно)
    const keyboard: { text: string }[][] = [];
    keyboardButtons.forEach((button) => {
      const rowIndex = button.row_order ? button.row_order - 1 : 0;
      if (!keyboard[rowIndex]) {
        keyboard[rowIndex] = [];
      }
      keyboard[rowIndex].push({ text: button.name });
    });

    console.log('Inline-клавиатура:', inlineKeyboard);
    console.log('Клавиатура:', keyboard);

    // Отправляем сообщение
    await ctx.reply('🎁 Выберите вариант промо:', {
      reply_markup: {
        inline_keyboard: inlineKeyboard.length > 0 ? inlineKeyboard : undefined,
        keyboard: keyboard.length > 0 ? keyboard : undefined,
        resize_keyboard: true,
      },
    });
  }

  async handleCallbackQuery(ctx: Context) {
    const action = ctx.callbackQuery['data'];

    // Ищем кнопку по `action`
    const button = await this.menuButtonRepository.findOne({
      where: { action },
    });

    if (!button) {
      await ctx.reply('❌ Неизвестная команда.');
      return;
    }

    // Отображаем контент кнопки
    await ctx.reply(button.content || 'Нет дополнительной информации.');
  }
}