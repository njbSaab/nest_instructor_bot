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
  ) {}

  async handleText(ctx: Context) {
    const text = ctx.message['text'];

    // Ищем кнопку по имени
    const button = await this.menuButtonRepository.findOne({
      where: { name: text },
    });

    if (!button) {
      // Если кнопка не найдена, показываем ошибку
      await ctx.reply('❌ Неизвестная команда. Выберите раздел из меню.');
      return;
    }

    if (button.parent_id === null) {
      // Если это кнопка верхнего уровня, обрабатываем как основное меню
      await this.handleMainMenu(ctx, button);
    } else {
      // Если это дочерняя кнопка, показываем её действие
      await this.handleChildMenu(ctx, button);
    }
  }

  private async handleMainMenu(ctx: Context, button: MenuButton) {
    // Загружаем дочерние кнопки
    const childButtons = await this.menuButtonRepository.find({
      where: { parent_id: button.id },
    });
  
    if (childButtons.length > 0) {
      // Если есть дочерние кнопки, формируем клавиатуру
      const keyboard = childButtons.map((btn) => [{ text: btn.name }]);
    
      await ctx.reply(button.content || 'Выберите:', {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
        },
      });
    } else {
      // Если дочерних кнопок нет, показываем контент
      await ctx.reply(button.content || 'Нет дополнительной информации.');
    }
  }

  private async handleChildMenu(ctx: Context, button: MenuButton) {
    if (button.action === 'back') {
      // Проверяем, есть ли родительская кнопка
      const parentButton = await this.menuButtonRepository.findOne({
        where: { id: button.parent_id },
      });
  
      if (parentButton && parentButton.parent_id === null) {
        // Если родительская кнопка верхнего уровня, возвращаем главное меню
        await this.sendMainMenu(ctx);
      } else if (parentButton) {
        // Иначе возвращаемся к родительскому меню
        await this.handleMainMenu(ctx, parentButton);
      } else {
        // Если родительская кнопка не найдена, возвращаем главное меню
        await this.sendMainMenu(ctx);
      }
    } else {
      // Показываем контент дочерней кнопки
      await ctx.reply(button.content || 'Нет дополнительной информации.');
    }
  }

  private async sendMainMenu(ctx: Context) {
    // Загружаем кнопки верхнего уровня (parent_id = null)
    const buttons = await this.menuButtonRepository.find({
      where: { parent_id: null },
      order: { id: 'ASC' },
    });
  
    console.log('Главное меню кнопки:', buttons);
  
    const keyboard = buttons.map((btn) => [{ text: btn.name }]);
  
    await ctx.reply('📋 Главное меню:', {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
      },
    });
  }
}