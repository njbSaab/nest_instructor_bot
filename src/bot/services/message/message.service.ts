import { PromoService } from '../promo/promo.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuButton } from '../../entities/menu-button.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
    private readonly promoService: PromoService,
  ) {}

  async handleText(ctx: Context) {
    const text = ctx.message['text'];

    // Ищем кнопку по имени
    const button = await this.menuButtonRepository.findOne({
      where: { name: text },
    });

    if (!button) {
      await ctx.reply('❌ Неизвестная команда. Выберите раздел из меню.');
      return;
    }

    if (button.action === 'promo') {
      console.log('Кнопка "Промо" нажата. Переходим к PromoService.');
      await this.promoService.sendPromoMenu(ctx);
    } else {
      // Обрабатываем другие кнопки
      if (button.parent_id === null) {
        await this.handleMainMenu(ctx, button);
      } else {
        await this.handleChildMenu(ctx, button);
      }
    }
  }
  private async handleMainMenu(ctx: Context, button: MenuButton) {
    console.log('Обрабатываем главное меню для кнопки:', button);

    // Загружаем дочерние кнопки
    const childButtons = await this.menuButtonRepository.find({
        where: { parent_id: button.id },
        order: { row_order: 'ASC', column_order: 'ASC' },
    });

    console.log('Дочерние кнопки для главного меню:', childButtons);

    if (childButtons.length > 0) {
        // Если есть дочерние кнопки, формируем клавиатуру
        const keyboard = childButtons.map((btn) => [{ text: btn.name }]);

        // Добавляем кнопку "Назад" только если parent_id != 1
        if (button.parent_id !== 1) {
            keyboard.push([{ text: '🔙 Назад' }]);
        }

        console.log('Сформированная клавиатура для главного меню:', keyboard);

        await ctx.reply(button.content || 'Выберите:', {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
            },
        });
    } else {
        console.log('Показываем контент кнопки:', button.content);
        await ctx.reply(button.content || 'Нет дополнительной информации.');
    }
  }
  private async handleChildMenu(ctx: Context, button: MenuButton) {
    console.log('Обрабатываем дочернюю кнопку:', button);

    if (button.action === 'back') {
        console.log('Кнопка "Назад" нажата.');

        // Возвращаемся к меню родительского уровня
        const parentButton = await this.menuButtonRepository.findOne({
            where: { id: button.parent_id },
        });

        console.log('Найденная родительская кнопка для возврата:', parentButton);

        if (parentButton && parentButton.parent_id === 1) {
            // Если родительский элемент - кнопка уровня 1, возвращаем главное меню
            await this.sendMainMenu(ctx);
        } else if (parentButton) {
            // Возвращаемся к меню родительского уровня
            await this.handleMainMenu(ctx, parentButton);
        } else {
            console.log('Родительская кнопка не найдена. Возвращаемся в главное меню.');
            await this.sendMainMenu(ctx);
        }
    } else {
        console.log('Показываем контент дочерней кнопки:', button.content);

        // Проверяем наличие дочерних кнопок
        const childButtons = await this.menuButtonRepository.find({
            where: { parent_id: button.id },
            order: { row_order: 'ASC', column_order: 'ASC' },
        });

        console.log('Дочерние кнопки для текущей кнопки:', childButtons);

        if (childButtons.length > 0) {
            const keyboard = childButtons.map((btn) => [{ text: btn.name }]);

            console.log('Сформированная клавиатура для дочерних кнопок:', keyboard);

            await ctx.reply(button.content || 'Выберите:', {
                reply_markup: {
                    keyboard: keyboard,
                    resize_keyboard: true,
                },
            });
        } else {
            // Если дочерних кнопок нет, показываем только контент кнопки
            await ctx.reply(button.content || 'Нет дополнительной информации.');
        }
    }
  }
  private async sendMainMenu(ctx: Context) {
    console.log('Отправляем главное меню...');

    const buttons = await this.menuButtonRepository.find({
        where: { parent_id: 1 },
        order: { row_order: 'ASC', column_order: 'ASC' },
    });

    console.log('Кнопки верхнего уровня для главного меню:', buttons);

    const keyboard: { text: string }[][] = [];
    buttons.forEach((button) => {
        const rowIndex = button.row_order - 1;
        if (!keyboard[rowIndex]) {
            keyboard[rowIndex] = [];
        }
        keyboard[rowIndex][button.column_order] = { text: button.name };
    });

    const filteredKeyboard = keyboard.filter((row) => row.length > 0);

    console.log('Сформированная клавиатура для главного меню:', filteredKeyboard);

    await ctx.reply('📋 Главное меню:', {
        reply_markup: {
            keyboard: filteredKeyboard,
            resize_keyboard: true,
        },
    });
  }
}