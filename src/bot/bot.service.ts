import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { MenuService } from './services/menu.service';
import { UsersService } from '../users/users.service';
import { GreetingBotService } from './services/greeting-bot.service';
import { UserSportsService } from './services/user-sports.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
    private readonly userSportsService: UserSportsService, 
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
      this.bot.launch()
      .then(() => console.log('[BotService] Бот запущен'))
      .catch((err) => console.error('[BotService] Ошибка запуска бота:', err));
        console.log('[BotService] Бот успешно запущен и ожидает команды.');
    } catch (error) {
      console.error('[BotService] Ошибка запуска бота:', error);
    }
  }

  /*
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
  /*
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
  /*
   * Обработка инлайн-кнопок
   */
  private async handleCallbackQuery(ctx: any) {
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery?.data;
  
    if (!callbackData) {
      console.log('[BotService] Callback без данных');
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }
  
    // Пытаемся распарсить callbackData как ID кнопки
    const buttonId = parseInt(callbackData, 10);
    if (isNaN(buttonId)) {
      console.log('[BotService] Некорректный ID кнопки:', callbackData);
      await ctx.answerCbQuery('Некорректные данные');
      return;
    }
  
    console.log(`[BotService] Нажата inline-кнопка с ID: ${buttonId}`);
  
    // 1. Ищем кнопку в базе
    const button = await this.menuService.getButtonById(buttonId);
    if (!button) {
      console.log(`[BotService] Кнопка с ID=${buttonId} не найдена.`);
      await ctx.reply('Кнопка не найдена.');
      await ctx.answerCbQuery();
      return;
    }

      // Проверяем, есть ли categorySportId (значит, это «опросная» кнопка)
    // if (button.categorySportId) {
    //   const userId = ctx.from.id;
    //   const categoryId = button.categorySportId; // 1=football, 2=basketball, ...

    //   // Определяем "да" или "нет", например, по названию кнопки
    //   const isYes = button.name.includes('yes'); 
    //   // или button.name === '✅ yes'

    //   await this.userSportsService.updateUserSport(userId, categoryId, isYes);

    //   if (isYes) {
    //     await ctx.reply('Вы подписались!');
    //   } else {
    //     await ctx.reply('Вы отписались!');
    //   }
      
    //   // Завершаем callback
    //   await ctx.answerCbQuery();
    //   return;
    // }
    if (button.categorySportId) {
      const userId = ctx.from.id;
      const categoryId = button.categorySportId;
      const isYes = button.name.includes('yes');
    
      await this.userSportsService.updateUserSport(userId, categoryId, isYes);
    
      await ctx.reply(isYes ? 'Вы подписались!' : 'Вы отписались!');
      
      // НЕ делаем return, чтобы ещё проверить button.url, button.postId
      // await ctx.answerCbQuery(); 
      // НЕ вызываем здесь return
    }
    // 2. Если у кнопки есть внешний URL — отправляем/открываем ссылку
    //    Обычно в Telegram inline-кнопки можно сразу делать с "url", и тогда бот не получает callback,
    //    но если нужно именно отреагировать на колбэк, то можно так:
    if (button.url) {
      console.log(`[BotService] У кнопки есть внешний URL: ${button.url}`);
      // Вариант A: Просто отправить сообщение с ссылкой
      await ctx.reply(`Вот ваша ссылка: ${button.url}`);
      // Вариант B: Можно попробовать answerCbQuery с ссылкой
      //    Это менее стандартно, поскольку Telegram обычно открывает ссылку автоматически,
      //    если inline-кнопка содержит поле url. Но если вам нужно через бота:
      // await ctx.answerCbQuery(`Открываю ссылку...`, { url: button.url });
  
      await ctx.answerCbQuery();
      return;
    }
  
    // 3. Если URL нет, но у кнопки есть привязанный postId — показываем этот пост
    if (button.postId) {
      console.log(`[BotService] У кнопки есть postId=${button.postId}. Отправляем пост.`);
      await this.handlePost(ctx, button.postId);
      await ctx.answerCbQuery();
      return;
    }
  
    // 4. Если ни URL, ни postId нет — скажем, что данных нет
    console.log('[BotService] Кнопка не содержит URL и не привязана к посту.');
    await ctx.reply('Нет данных для отображения по этой кнопке.');
    await ctx.answerCbQuery();
  }
  /*
   * Логика обработки поста
   */
  // private async handlePost(ctx: any, postId: number) {
  //   console.log(`[BotService] Обрабатываем пост с ID: ${postId}`);
  //   const post = await this.menuService.getPostById(postId);
  //   if (!post) {
  //     await ctx.reply('Пост не найден.');
  //     return;
  //   }

  //   const buttons = await this.menuService.getButtonsForPost(post.id);
  //   let messageText = post.post_content || '';

  //   if (post.post_image_url) {
  //     await ctx.replyWithPhoto(post.post_image_url, {
  //       caption: messageText,
  //       reply_markup: buttons.length
  //         ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
  //         : undefined,
  //     });
  //   } else {
  //     await ctx.reply(messageText, {
  //       reply_markup: buttons.length
  //         ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
  //         : undefined,
  //     });
  //   }

  //   if (post.next_post) {
  //     await this.handlePost(ctx, post.next_post.id);
  //   }
  // }
  private async handlePost(ctx: any, postId: number) {
    console.log(`[BotService] Обрабатываем пост с ID: ${postId}`);
    const post = await this.menuService.getPostById(postId);
    if (!post) {
      await ctx.reply('Пост не найден.');
      return;
    }
  
    // Получаем кнопки, связанные с постом
    const buttons = await this.menuService.getButtonsForPost(post.id);
  
    // Формируем inline-кнопки с учётом url/нет url
    const inlineKeyboard = buttons.map((btn) => {
      if (btn.url) {
        // Кнопка с внешней ссылкой -> Telegram сам откроет, без колбэка
        return [{ text: btn.name, url: btn.url }];
      } else {
        // Обычная кнопка -> callback_data
        return [{ text: btn.name, callback_data: btn.id.toString() }];
      }
    });
  
    // Само сообщение (с картинкой или без)
    const messageText = post.post_content || '';
    if (post.post_image_url) {
      await ctx.replyWithPhoto(post.post_image_url, {
        caption: messageText,
        reply_markup: inlineKeyboard.length
          ? { inline_keyboard: inlineKeyboard }
          : undefined,
      });
    } else {
      await ctx.reply(messageText, {
        reply_markup: inlineKeyboard.length
          ? { inline_keyboard: inlineKeyboard }
          : undefined,
      });
    }
  
    // Если у поста есть next_post, рекурсивно показываем следующий пост
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

