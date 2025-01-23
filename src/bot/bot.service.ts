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
      console.log('[MenuService] Главное меню:', menus);
    
      const selectedMenu = menus.find((menu) => menu.name === text);
    
      if (!selectedMenu) {
        console.log('[BotService] Меню не найдено для текста:', text);
        await ctx.reply('Некорректный выбор. Попробуйте снова.');
        return;
      }
    
      console.log(`[BotService] Выбрано меню с ID: ${selectedMenu.id}`);
      console.log('[BotService] Связанный пост:', selectedMenu.linked_post);
    
      if (selectedMenu.linked_post) {
        console.log(
          `[BotService] Переходим к связанному посту с ID: ${selectedMenu.linked_post.id}`
        );
        await this.handlePost(ctx, selectedMenu.linked_post.id);
      } else {
        console.log('[BotService] Нет связанных постов для выбранного меню');
        await ctx.reply('Нет связанных постов для этого раздела.');
      }
    });

    // Обработка инлайн-кнопок
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

  // Получаем кнопку по ID
  const button = await this.menuService.getButtonById(buttonId);

  if (!button) {
    console.log('[BotService] Кнопка не найдена:', buttonId);
    await ctx.reply('Действие для кнопки не найдено.');
    await ctx.answerCbQuery();
    return;
  }

  // Проверяем, связана ли кнопка с постом
  const post = await this.menuService.getPostByButtonId(buttonId);
  if (post) {
    console.log(`[BotService] Кнопка вызывает пост с ID: ${post.id}`);
    await this.handlePost(ctx, post.id);
  } else if (button.url) {
    // Если кнопка связана с URL, отправляем ссылку
    console.log(`[BotService] Кнопка-ссылка: ${button.url}`);
    await ctx.reply(`Откройте ссылку: ${button.url}`);
  } else {
    // Если кнопка не связана ни с постом, ни с URL
    console.log('[BotService] Кнопка без действия.');
    await ctx.reply('Действие для кнопки не настроено.');
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

    await ctx.reply('ボタンを選択👇', {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }
  
  private async handlePost(ctx: any, postId: number) {
    console.log(`[BotService] Обрабатываем пост с ID: ${postId}`);
  
    // Получаем пост
    const post = await this.menuService.getPostById(postId);
    console.log('[MenuService] Полученный пост:', post);
  
    if (!post) {
      console.log('[BotService] Пост не найден:', postId);
      await ctx.reply('Пост не найден.');
      return;
    }
  
    // Получаем кнопки для поста
    const buttons = await this.menuService.getButtonsForPost(post.id);
    console.log('[MenuService] Кнопки для поста:', buttons);
  
    // Формируем текст сообщения
    let messageText = '';
    if (post.post_content) messageText += `${post.post_content}\n\n`;
  
    // Отправляем изображение или текст
    if (post.post_image_url) {
      console.log(`[BotService] Отправляем изображение с кнопками для поста ID=${post.id}`);
      await ctx.replyWithPhoto(post.post_image_url, {
        caption: messageText || '',
        reply_markup: buttons.length
          ? {
              inline_keyboard: buttons.map((button) => [
                { text: button.name, callback_data: button.id.toString() },
              ]),
            }
          : undefined,
      });
    } else if (messageText.trim().length > 0) {
      console.log(`[BotService] Отправляем текст с кнопками для поста ID=${post.id}`);
      await ctx.reply(messageText.trim(), {
        reply_markup: buttons.length
          ? {
              inline_keyboard: buttons.map((button) => [
                { text: button.name, callback_data: button.id.toString() },
              ]),
            }
          : undefined,
      });
    } else {
      // Если нет контента, только кнопки
      console.log('[BotService] Пост без контента. Отправляем только кнопки.');
      if (buttons.length > 0) {
        await ctx.reply('Выберите действие:', {
          reply_markup: {
            inline_keyboard: buttons.map((button) => [
              { text: button.name, callback_data: button.id.toString() },
            ]),
          },
        });
      }
    }
  
    // Переход к следующему посту, если он есть
    if (post.next_post) {
      console.log(`[BotService] Переходим к следующему посту с ID=${post.next_post.id}`);
      await this.handlePost(ctx, post.next_post.id);
    } else {
      console.log('[BotService] Следующего поста нет.');
    }
  }
}


