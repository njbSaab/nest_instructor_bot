import { Injectable } from '@nestjs/common';
import { MenuService } from '../services/menu.service';

@Injectable()
export class TextMessageHandler {
  constructor(private readonly menuService: MenuService) {}

  async handle(ctx: any) {
    const text = ctx.message?.text;
    if (!text) {
      console.log('[TextMessageHandler] Сообщение без текста');
      return;
    }

    console.log(`[TextMessageHandler] Получено текстовое сообщение: "${text}"`);
    const menus = await this.menuService.getMainMenu();
    console.log('[MenuService] Главное меню:', menus);

    const selectedMenu = menus.find((menu) => menu.name === text);
    if (!selectedMenu) {
      console.log('[TextMessageHandler] Меню не найдено для текста:', text);
      await ctx.reply('Некорректный выбор. Попробуйте снова.');
      return;
    }

    console.log(`[TextMessageHandler] Выбрано меню с ID: ${selectedMenu.id}`);
    if (selectedMenu.linked_post) {
      await ctx.reply(`Переходим к посту ID: ${selectedMenu.linked_post.id}`);
    } else {
      await ctx.reply('Нет связанных постов для этого раздела.');
    }
  }
}