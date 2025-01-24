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

    this.bot.start((ctx) => this.handleStartCommand(ctx));
    this.bot.hears(/.+/, (ctx) => this.handleTextMessage(ctx));
    this.bot.on('callback_query', (ctx) => this.handleCallbackQuery(ctx));

    try {
      await this.bot.launch();
      console.log('[BotService] Бот успешно запущен и ожидает команды.');
    } catch (error) {
      console.error('[BotService] Ошибка запуска бота:', error);
    }
  }

  /**
   * Обработка команды /start
   */
  private async handleStartCommand(ctx: any) {
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
  }
  /**
   * Обработка текстового сообщения
   */
  private async handleTextMessage(ctx: any) {
    const text = ctx.message?.text;
    if (!text) {
        console.log('[BotService] Сообщение без текста');
        return;
    }

    console.log(`[BotService] Получено текстовое сообщение: "${text}"`);

    // Если пользователь нажал "⬅️ Назад"
    if (text === '⬅️ Назад') {
        const userId = ctx.from.id;
        const lastMenu = await this.menuService.getLastMenu(userId);

        // Скрыть все подменю перед возвратом
        if (lastMenu?.id) {
            console.log(`[BotService] Скрываем подменю для menuId=${lastMenu.id}`);
            await this.menuService.updateMenuState(lastMenu.id, false);
        }

        if (lastMenu?.parentId) {
            console.log(`[BotService] Возвращаемся к родительскому меню с ID: ${lastMenu.parentId}`);
            const parentMenu = await this.menuService.getMenuById(lastMenu.parentId);

            if (parentMenu) {
                const subMenus = await this.menuService.getSubMenusByParentId(parentMenu.id);
                const keyboard = subMenus.map((submenu) => [{ text: submenu.name }]);
                keyboard.push([{ text: '⬅️ Назад' }]); // Добавляем кнопку "Назад"

                await ctx.reply('ボタンを選択👇', {
                    reply_markup: {
                        keyboard,
                        resize_keyboard: true,
                    },
                });

                await this.menuService.setLastMenu(userId, parentMenu.id); // Обновляем состояние пользователя
                return;
            }
        }

        console.log('[BotService] Нет родительского меню для возврата.');
        await this.sendMainMenu(ctx); // Возвращаемся в главное меню, если родительского меню нет
        return;
    }

    // Получаем главное меню
    const menus = await this.menuService.getMainMenu();
    const selectedMenu = menus.find((menu) => menu.name === text);

    if (!selectedMenu) {
        console.log('[BotService] Меню не найдено для текста:', text);
        await ctx.reply('Некорректный выбор. Попробуйте снова.');
        return;
    }

    console.log(`[BotService] Выбрано меню с ID: ${selectedMenu.id}`);

    // Скрываем все подменю текущего уровня перед активацией
    await this.menuService.updateMenuState(selectedMenu.id, false);

    // Активируем подменю перед их отображением
    await this.menuService.updateMenuState(selectedMenu.id, true);

    const subMenus = await this.menuService.getSubMenusByParentId(selectedMenu.id);

    if (subMenus.length > 0) {
        console.log(`[BotService] Меню имеет подменю:`, subMenus);
        const keyboard = subMenus.map((submenu) => [{ text: submenu.name }]);
        keyboard.push([{ text: '⬅️ Назад' }]); // Добавляем кнопку "Назад"

        await ctx.reply('ボタンを選択👇', {
            reply_markup: {
                keyboard,
                resize_keyboard: true,
            },
        });

        const userId = ctx.from.id;
        await this.menuService.setLastMenu(userId, selectedMenu.id); // Сохраняем состояние пользователя
    } else if (selectedMenu.linked_post) {
        console.log(`[BotService] Переходим к связанному посту с ID: ${selectedMenu.linked_post.id}`);
        await this.handlePost(ctx, selectedMenu.linked_post.id);
    } else {
        await ctx.reply('Нет связанных данных для этого меню.');
    }
  }
  /**
   * Обработка инлайн-кнопок
   */
  private async handleCallbackQuery(ctx: any) {
    const callbackQuery = ctx.callbackQuery as CallbackQuery;
    const callbackData = (callbackQuery as any).data;
  
    if (!callbackData) {
      console.log('[BotService] Callback без данных');
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }
  
    const menuId = parseInt(callbackData, 10);
    console.log(`[BotService] Нажата кнопка с ID: ${menuId}`);
  
    if (isNaN(menuId)) {
      console.log('[BotService] Некорректный menuId');
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }
  
    const menu = await this.menuService.getMenuById(menuId);
    if (!menu) {
      console.log(`[BotService] Меню с ID=${menuId} не найдено.`);
      await ctx.reply('Меню не найдено.');
      await ctx.answerCbQuery();
      return;
    }
  
    const subMenus = await this.menuService.getSubMenusByParentId(menuId);
    const keyboard = subMenus.map((submenu) => [
      { text: submenu.name, callback_data: submenu.id.toString() },
    ]);
  
    // Если это не главное меню, добавляем кнопку "Назад"
    if (menu.parentId !== null) {
      console.log(`[BotService] Добавляем кнопку "Назад" для parentId=${menu.parentId}`);
      keyboard.push([{ text: '⬅️ Назад', callback_data: menu.parentId.toString() }]);
    }
  
    if (subMenus.length > 0) {
      console.log('[BotService] Отображаем подменю:', keyboard);
      await ctx.reply('Выберите вариант:', {
        reply_markup: { inline_keyboard: keyboard },
      });
      await ctx.answerCbQuery();
      return;
    }
  
    if (menu.linked_post) {
      console.log(`[BotService] Кнопка вызывает пост с ID: ${menu.linked_post.id}`);
      await this.handlePost(ctx, menu.linked_post.id);
      await ctx.answerCbQuery();
      return;
    }
  
    console.log('[BotService] Нет данных для отображения.');
    await ctx.reply('Нет данных для отображения.');
    await ctx.answerCbQuery();
  }

  /**
   * Логика обработки поста
   */
  private async handlePost(ctx: any, postId: number) {
    console.log(`[BotService] Обрабатываем пост с ID: ${postId}`);
    const post = await this.menuService.getPostById(postId);
    if (!post) {
      await ctx.reply('Пост не найден.');
      return;
    }

    const buttons = await this.menuService.getButtonsForPost(post.id);
    let messageText = post.post_content || '';

    if (post.post_image_url) {
      await ctx.replyWithPhoto(post.post_image_url, {
        caption: messageText,
        reply_markup: buttons.length
          ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
          : undefined,
      });
    } else {
      await ctx.reply(messageText, {
        reply_markup: buttons.length
          ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
          : undefined,
      });
    }

    if (post.next_post) {
      await this.handlePost(ctx, post.next_post.id);
    }
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

