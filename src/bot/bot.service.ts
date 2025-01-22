import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { MenuService } from './services/menu.service';
import { UsersService } from '../users/users.service';
import { GreetingBotService } from './services/greeting-bot.service';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
  ) {
    const botToken = this.configService.get<string>('TEL_TOKEN');
    if (!botToken) {
      throw new Error('Telegram токен не определен в .env файле');
    }
    this.bot = new Telegraf(botToken);
  }

  async onModuleInit() {
    console.log('[BotService] Инициализация Telegraf...');

    // Обработка команды /start
    this.bot.start(async (ctx) => {
      console.log('[BotService] Получена команда /start');
      const user = await this.usersService.findOrCreateUser(ctx.from);
      console.log('[BotService] Пользователь добавлен/обновлён:', user);

      const greetings = await this.greetingBotService.getAllGreetings();
      for (const greeting of greetings) {
        const personalizedText = greeting.greeting_text.replace('[Name]', user.first_name || 'there');
        if (greeting.image_url) {
          await ctx.replyWithPhoto(greeting.image_url, { caption: personalizedText });
        } else {
          await ctx.reply(personalizedText);
        }
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      await this.sendMainMenu(ctx);
    });

    // Обработка текстового ввода (главное меню)
    this.bot.hears(/.+/, async (ctx) => {
      const text = ctx.message?.text;

      if (!text) {
        console.log('[BotService] Сообщение без текста');
        return;
      }

      console.log(`[BotService] Получено текстовое сообщение: "${text}"`);

      const menus = await this.menuService.getMainMenu();
      const selectedMenu = menus.find((menu) => menu.name === text);

      if (!selectedMenu) {
        console.log('[BotService] Меню не найдено для текста:', text);
        await ctx.reply('Некорректный выбор. Попробуйте снова.');
        return;
      }

      console.log(`[BotService] Выбрано меню с ID: ${selectedMenu.id}`);

      const post = await this.menuService.getPostForMenu(selectedMenu.id);
      const buttons = await this.menuService.getInlineButtonsForMenu(selectedMenu.id);

      if (post) {
        console.log('[BotService] Пост найден:', post);

        await ctx.reply(post.post_title);
        await ctx.reply(post.post_content, {
          reply_markup: {
            inline_keyboard: buttons.map((button) => [
              { text: button.name, callback_data: button.id.toString() },
            ]),
          },
        });
      } else {
        console.log('[BotService] Пост не найден для menuId:', selectedMenu.id);
        await ctx.reply('Пост для данного меню не найден.');
      }
    });

    // Обработка инлайн-кнопок
    this.bot.on('callback_query', async (ctx) => {
      const callbackQuery = ctx.callbackQuery as CallbackQuery;
      const callbackData = (callbackQuery as any).data;
      
      if (!callbackData) {
        console.log('[BotService] Callback без данных');
        await ctx.answerCbQuery('Некорректные данные');
        return;
      }

      const buttonId = parseInt(callbackData, 10);

      if (isNaN(buttonId)) {
        console.log('[BotService] Некорректный buttonId');
        await ctx.answerCbQuery('Некорректные данные');
        return;
      }

      console.log(`[BotService] Нажата кнопка с ID: ${buttonId}`);

      const button = await this.menuService.getButtonById(buttonId);
      if (button) {
        console.log('[BotService] Кнопка найдена:', button);

        if (button.response_type === 'text' && button.response_text) {
          await ctx.reply(button.response_text);
        } else if (button.response_type === 'image' && button.response_image_url) {
          await ctx.replyWithPhoto(button.response_image_url);
        } else {
          await ctx.reply('Ответ на кнопку не настроен.');
        }
      } else {
        console.log('[BotService] Кнопка не найдена для buttonId:', buttonId);
        await ctx.reply('Действие для кнопки не найдено.');
      }

      await ctx.answerCbQuery();
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
        one_time_keyboard: false,
      },
    });
  }
}


