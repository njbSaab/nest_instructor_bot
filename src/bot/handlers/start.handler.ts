// start-command.handler.ts
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { GreetingBotService } from '../services/greeting-bot.service';
import { MenuService } from '../services/menu.service';

@Injectable()
export class StartCommandHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
    private readonly menuService: MenuService,
  ) {}

  async handle(ctx: any): Promise<void> {
    console.log('[StartCommandHandler] Получена команда /start');
    const user = await this.usersService.findOrCreateUser(ctx.from);
    console.log('[StartCommandHandler] Пользователь добавлен/обновлён:', user);

    const greetings = await this.greetingBotService.getAllGreetings();
    for (const greeting of greetings) {
      const personalizedText = greeting.greeting_text.replace(
        '[Name]',
        user.first_name || 'there'
      );
      if (greeting.image_url) {
        await ctx.replyWithPhoto(greeting.image_url, { caption: personalizedText });
      } else {
        await ctx.reply(personalizedText);
      }
      // Пауза между отправкой сообщений
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    // Отправляем главное меню
    await this.menuService.sendMainMenu(ctx);
  }
    /*
  * Отправка главного меню с возможностью фильтрации по parentId
  */
  private async sendMainMenu(ctx: any, parentId?: number) {
    const menus = await this.menuService.getMainMenu();
    const keyboard = menus.map((menu) => [{ text: menu.name }]);

    await ctx.reply('ボタンを選択👇', {
      reply_markup: { keyboard, resize_keyboard: true, one_time_keyboard: false },
    });
  }
}