import { PromoService } from '../promo/promo.service';
import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuButton } from '../../entities/menu-button.entity';
import { KeyboardService } from '../keyboard/keyboard.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
    private readonly promoService: PromoService,
    private readonly keyboardService: KeyboardService, 

  ) {}

  async handleText(ctx: Context) {
    const text = ctx.message['text'];
    console.log(`Получен текст сообщения: ${text}`);

    // Ищем кнопку по имени
    const button = await this.menuButtonRepository.findOne({
        where: { name: text },
    });

    if (!button) {
        console.log(`Кнопка с текстом "${text}" не найдена в базе.`);
        await ctx.reply('❌ Неизвестная команда. Выберите раздел из меню.');
        return;
    }

    console.log(`Найдена кнопка:`, button);

    if (button.action === 'promo') {
        console.log('Кнопка "Промо" нажата. Переходим к PromoService.');
        await this.promoService.sendPromoMenu(ctx);
    } else if (button.action === 'back') {
        console.log('Кнопка "Назад" нажата.');
        await this.handleBackAction(ctx, button);
    } else {
        // Обрабатываем другие кнопки
        if (button.parent_id === null) {
            console.log('Обрабатываем как главное меню.');
            await this.handleMainMenu(ctx, button);
        } else {
            console.log('Обрабатываем как дочернее меню.');
            await this.handleChildMenu(ctx, button);
        }
    }
  }

  private async handleMainMenu(ctx: Context, button: MenuButton) {
    console.log('Обрабатываем главное меню для кнопки:', button);

    const keyboard = await this.keyboardService.generateKeyboard(button.id);

    if (keyboard.length > 0) {
        console.log('Сформированная клавиатура для главного меню:', keyboard);
        await ctx.reply(button.content || 'Выберите:', {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
            },
        });
    } else {
        console.log('Нет дочерних кнопок. Показываем только контент.');
        await ctx.reply(button.content || 'Нет дополнительной информации.');
    }
  }

  private async handleChildMenu(ctx: Context, button: MenuButton) {
    console.log('Обрабатываем дочернюю кнопку:', button);

    if (button.action === 'back') {
        console.log('Кнопка "Назад" нажата.');
        await this.handleBackAction(ctx, button);
        return;
    }

    console.log('Показываем контент дочерней кнопки:', button.content);

    // Используем KeyboardService для формирования клавиатуры
    const keyboard = await this.keyboardService.generateKeyboard(button.id);

    // Добавляем кнопку "Назад", если есть дочерние элементы или это не главное меню
    if (button.parent_id !== null) {
        console.log('Добавляем кнопку "Назад" в клавиатуру.');
        keyboard.push([{ text: '🔙 Назад' }]); // Добавляем кнопку как отдельную строку
    }

    if (keyboard.length > 0) {
        console.log('Сформированная клавиатура для дочерних кнопок:', keyboard);
        await ctx.reply(button.content || 'Выберите:', {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
            },
        });
    } else {
        console.log('Нет дочерних кнопок. Показываем только контент.');
        await ctx.reply(button.content || 'Нет дополнительной информации.');
    }
}

  private async handleBackAction(ctx: Context, button: MenuButton) {
    console.log(`Обрабатываем действие "Назад" для кнопки:`, button);

    const parentButton = await this.menuButtonRepository.findOne({
        where: { id: button.parent_id },
    });

    if (parentButton) {
        console.log(`Родительская кнопка найдена:`, parentButton);

        const keyboard = await this.keyboardService.generateKeyboard(parentButton.id, parentButton.parent_id !== null);

        console.log('Сформированная клавиатура для родительского меню:', keyboard);

        await ctx.reply(parentButton.content || 'Выберите:', {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true,
            },
        });
    } else {
        console.log('Родительская кнопка не найдена. Возвращаемся в главное меню.');
        await this.sendMainMenu(ctx);
    }
  }
  private async sendMainMenu(ctx: Context) {
    console.log('Формируем главное меню...');

    const keyboard = await this.keyboardService.generateKeyboard(1);

    if (!keyboard.length) {
        console.log('Главное меню не сформировано. Кнопки отсутствуют.');
        await ctx.reply('Главное меню временно недоступно.');
        return;
    }

    console.log('Сформированная клавиатура для главного меню:', keyboard);

    await ctx.reply('📋 Главное меню:', {
        reply_markup: {
            keyboard: keyboard,
            resize_keyboard: true,
        },
    });
  }
}