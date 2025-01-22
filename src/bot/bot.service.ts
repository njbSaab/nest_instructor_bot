import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { MenuService } from './services/menu.service';
import { UsersService } from '../users/users.service';
import { GreetingBotService } from './services/greeting-bot.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService, // Сервис для приветствия
  ) {
    const botToken = this.configService.get<string>('TEL_TOKEN');
    if (!botToken) {
      throw new Error('Telegram токен не определен в .env файле');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    console.log('[BotService] Инициализация Telegraf...');

    this.bot.start(async (ctx) => {
      console.log('[BotService] Получена команда /start');

      const telegramUser = ctx.from;
      const user = await this.usersService.findOrCreateUser({
        id: telegramUser.id,
        is_bot: telegramUser.is_bot,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        language_code: telegramUser.language_code,
      });

      console.log('[BotService] Пользователь добавлен/обновлён:', user);

      // Получаем приветственное сообщение
      const greeting = await this.greetingBotService.getGreeting();

      if (greeting.image_url) {
        await ctx.replyWithPhoto(greeting.image_url, { caption: greeting.greeting_text });
      } else {
        await ctx.reply(greeting.greeting_text);
      }

      await this.sendMainMenu(ctx);
    });

    try {
      await this.bot.launch();
      console.log('[BotService] Бот успешно запущен и ожидает команды.');
    } catch (error) {
      console.error('[BotService] Ошибка запуска бота:', error);
    }
  }

  private async sendMainMenu(ctx: any) {
    const menus = await this.menuService.getMainMenu();
    console.log('[BotService] Главное меню загружено:', menus);

    const keyboard = menus.map((menu) => [{ text: menu.name }]);
    await ctx.reply('Выберите раздел:', {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
      },
    });
  }
}