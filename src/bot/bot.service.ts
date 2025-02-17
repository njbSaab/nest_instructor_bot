import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { MenuService } from './services/menu.service';
import { UsersService } from '../users/users.service';
import { GreetingBotService } from './services/greeting-bot.service';
import { UserSportsService } from './services/user-sports.service';
import { UserNewsService } from './services/user-news.service';
import{ UserNewsCategoryService } from './services/user-news-category.service'
import axios from 'axios';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  // В начале класса BotService:
  private emailVerification = new Map<number, { code: string; attempts: number }>();
  
  constructor(
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
    private readonly userSportsService: UserSportsService, 
    private readonly userServiceNews: UserNewsService,
    private readonly userNewsCategoryService: UserNewsCategoryService
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

  // Получаем пользователя
  const user = await this.usersService.findOrCreateUser(ctx.from);
  // Если пользователь находится в состоянии ожидания email
  // Внутри метода handleTextMessage, когда пользователь в состоянии 'awaiting_email'
  
    // Если пользователь находится в состоянии ожидания email
    if (user.state === 'awaiting_email') {
      if (!this.validateEmail(text)) {
        await ctx.reply('Некорректный email. Пожалуйста, введите правильный email:');
        return;
      }
      
      // Генерируем случайный 5-значный код
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      
      try {
        // Отправляем HTTP POST запрос на указанный адрес с email и кодом
        const response = await axios.post('http://localhost:3123/api/feedback', {
          email: text,
          code: code,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Email sent:', response.data);
      } catch (error) {
        console.error('Ошибка при отправке email:', error);
        await ctx.reply('Произошла ошибка при отправке кода на ваш email. Попробуйте позже.');
        return;
      }
      
      // Обновляем email, устанавливаем isNewsActive = true
      await this.usersService.updateEmailAndActivateNews(user.id, text);
      await ctx.reply('Спасибо! Ваш email сохранен, новости активированы.');
      
      // Сохраняем сгенерированный код и 3 попытки для пользователя
      this.emailVerification.set(user.id, { code, attempts: 3 });
      
      // Переводим пользователя в состояние ожидания ввода кода
      await this.usersService.updateUserState(user.id, 'awaiting_code');
      
      await ctx.reply('Пожалуйста, введите код, который был отправлен на ваш email:');
      return;
    }

    // Если пользователь находится в состоянии ожидания кода
    if (user.state === 'awaiting_code') {
      const verification = this.emailVerification.get(user.id);
      if (!verification) {
        // Если данных нет, просим ввести email заново
        await this.usersService.updateUserState(user.id, 'awaiting_email');
        await ctx.reply('Произошла ошибка. Пожалуйста, введите ваш email снова:');
        return;
      }
      
      if (text === verification.code) {
        // Код введён верно, обновляем состояние пользователя
        await this.usersService.updateUserState(user.id, 'email_getted');
        await ctx.reply('Код подтвержден! Ваш email подтвержден, и новости активированы.');
        // Удаляем данные верификации
        this.emailVerification.delete(user.id);
        
        // Выводим inline-клавиатуру с кнопками для подписки на новости
        await this.promptNewsSubscription(ctx);
      } else {
        // Код неверный, уменьшаем количество попыток
        verification.attempts--;
        if (verification.attempts > 0) {
          await ctx.reply(`Неверный код. Осталось ${verification.attempts} попыток. Пожалуйста, попробуйте снова:`);
        } else {
          await ctx.reply('Вы исчерпали все попытки. Пожалуйста, введите ваш email снова:');
          // Сбрасываем состояние и удаляем данные верификации
          await this.usersService.updateUserState(user.id, 'awaiting_email');
          this.emailVerification.delete(user.id);
        }
      }
      return;
    }
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
        await ctx.reply('Некорректный выбор. Попробуйте снова. 239');
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
  
    // Если это кнопки подписки на новости (news_subscribe_yes/ no)
    if (callbackData === 'news_subscribe_yes') {
      const userId = ctx.from.id;
      const subscribedCategories = await this.userNewsCategoryService.getSubscriptions(userId);
      const newsItems = await this.userServiceNews.getNewsByCategories(subscribedCategories);
      if (newsItems.length > 0) {
        let index = 0;
        const sendNextNews = async () => {
          const news = newsItems[index];
          if (news.post_image_url) {
            await ctx.replyWithPhoto(news.post_image_url, {
              caption: `${news.post_title}\n\n${news.post_content}\n\nСсылка: ${news.news_url || ''}`,
            });
          } else {
            await ctx.reply(`${news.post_title}\n\n${news.post_content}\n\nСсылка: ${news.news_url || ''}`);
          }
          index++;
          if (index < newsItems.length) {
            // Ждем 2 секунды перед отправкой следующей новости
            setTimeout(sendNextNews, 2000);
          }
        };
        await sendNextNews();
      } else {
        await ctx.reply('К сожалению, новостей по вашим категориям пока нет.');
      }
      await ctx.answerCbQuery();
      return;
    }

    if (callbackData === 'news_subscribe_no') {
      await ctx.reply('Хорошо, новости не будут отправляться.');
      await ctx.answerCbQuery();
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
    const button = await this.menuService.getButtonById(buttonId);
    if (!button) {
      console.log(`[BotService] Кнопка с ID=${buttonId} не найдена.`);
      await ctx.reply('Кнопка не найдена.');
      await ctx.answerCbQuery();
      return;
    }
  
    // Если это кнопка для новостей (categorySportId === 0)
    if (button.categorySportId === 0) {
      const userId = ctx.from.id;
      const user = await this.usersService.findOrCreateUser(ctx.from);
      // Если у пользователя запо// Пример фрагмента кода в BotService:
      if (button.categorySportId === 0) {
        const userId = ctx.from.id;
        const user = await this.usersService.findOrCreateUser(ctx.from);
        if (user.email && user.isNewsActive) {
          // Получаем подписки как массив имен категорий
          const subscribedCategories = await this.userNewsCategoryService.getSubscriptions(userId);
          const newsItems = await this.userServiceNews.getNewsByCategories(subscribedCategories);

          if (newsItems.length > 0) {
            let index = 0;
            const sendNextNews = async () => {
              const news = newsItems[index];
              if (news.post_image_url) {
                await ctx.replyWithPhoto(news.post_image_url, {
                  caption: `${news.post_title}\n\n${news.post_content}\n\nСсылка: ${news.news_url || ''}`,
                });
              } else {
                await ctx.reply(`${news.post_title}\n\n${news.post_content}\n\nСсылка: ${news.news_url || ''}`);
              }
              index++;
              if (index < newsItems.length) {
                setTimeout(sendNextNews, 2000);
              }
            };
            await sendNextNews();
          } else {
            await ctx.reply('К сожалению, новостей по вашим категориям пока нет.');
          }
          await ctx.answerCbQuery();
          return;
        } else {
          await ctx.reply('Для получения новостей заполните опрос:');
          // Логика опроса остается, если email не заполнен или новости не активированы
        }
      } else {
        // Если email отсутствует или новости не активированы – запускаем опрос (вместо показа новости)
        // Здесь запускается стандартная логика вопросов по категориям (ветка ниже)
        // Вы можете, например, сообщить, что опрос начнется
        await ctx.reply('Для получения новостей заполните опрос:');
        // Затем можно вызвать функцию обработки опросных кнопок (например, ниже, если button.categorySportId != 0)
        // Или просто продолжить выполнение кода ниже
        // В данном примере мы не делаем return, чтобы дальше выполнялась ветка с обработкой опросных кнопок
      }
    }
    // Новый код для обработки опроса подписок:
    if (button.categorySportId) {
      const userId = ctx.from.id;
      const categoryId = button.categorySportId; // ID из news_category
      const isYes = button.name.includes('yes'); // Определяем, подписывается ли пользователь
      
      // Обновляем подписку через новый сервис
      await this.userNewsCategoryService.updateSubscription(userId, categoryId, isYes);
      
      await ctx.reply(isYes ? 'Вы подписались!' : 'Вы отписались!');
      
      const maxCategoryId = await this.menuService.getMaxCategorySportId();
      if (categoryId === maxCategoryId) {
        await this.usersService.updateUserState(userId, 'awaiting_email');
        await ctx.reply('Спасибо за ответы!');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ctx.reply('Подтвердите свой выбор категории. Мы пришлем Вам код на почту.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ctx.reply('Введите свой email:');
        await ctx.answerCbQuery();
        return;
      }
      
      await ctx.answerCbQuery();
    }
    // Если у кнопки есть внешний URL – отправляем его
    if (button.url) {
      console.log(`[BotService] У кнопки есть внешний URL: ${button.url}`);
      await ctx.reply(`Вот ваша ссылка: ${button.url}`);
      await ctx.answerCbQuery();
      return;
    }
    // Если у кнопки есть postId – показываем пост
    if (button.postId) {
      console.log(`[BotService] У кнопки есть postId=${button.postId}. Отправляем пост.`);
      await this.handlePost(ctx, button.postId);
      await ctx.answerCbQuery();
      return;
    }
    console.log('[BotService] Кнопка не содержит URL и не привязана к посту.');
    await ctx.reply('Нет данных для отображения по этой кнопке.');
    await ctx.answerCbQuery();
  }

  /*
   * Логика обработки поста
   */
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
  /*
  * Валидация эмаила
  */
  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  /*
  * меню подписки на новости
  */
  private async promptNewsSubscription(ctx: any): Promise<void> {
    await ctx.reply('Желаете получать новости?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Да', callback_data: 'news_subscribe_yes' },{ text: '❌ Нет', callback_data: 'news_subscribe_no' }],
        ],
      },
    });
  }
  /*
  * отправка пуша 
  */
  public async sendMessage(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      console.error(`Ошибка при отправке сообщения пользователю ${chatId}:`, error);
    }
  }
}

