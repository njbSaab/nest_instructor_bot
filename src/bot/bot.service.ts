import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { MenuService } from './services/menu.service';
import { UsersService } from '../users/users.service';
import { GreetingBotService } from './services/greeting-bot.service';
import { UserNewsService } from './services/user-news.service';
import{ UserNewsCategoryService } from './services/user-news-category.service'
import axios from 'axios';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;
  // В начале класса BotService:
  private emailVerification = new Map<number, { code: string; attempts: number }>();
  private readonly adminChatId = 7066816061;

  constructor(
    private readonly configService: ConfigService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
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
      await this.notifyAdmin(error, 'Ошибка запуска бота');

    }
  }

  /*
   * Обработка команды /start
   */
  private async handleStartCommand(ctx: any) {
    try {
      console.log('[BotService] Получена команда /start');
      const user = await this.usersService.findOrCreateUser(ctx.from);
      console.log('[BotService] Пользователь добавлен/обновлён:', user);
    
      const greetings = await this.greetingBotService.getAllGreetings();
      for (const greeting of greetings) {
        const personalizedText = greeting.greeting_text.replace('[Name]', user.first_name || 'there');
        if (greeting.image_url) {
          try {
            await ctx.replyWithPhoto(greeting.image_url, { caption: personalizedText });
          } catch (photoError) {
            console.error('[BotService] Ошибка при отправке фотографии:', photoError);
            await this.notifyAdmin(photoError, 'Ошибка при отправке фотографии:');

            await ctx.reply(personalizedText);
          }
        } else {
          await ctx.reply(personalizedText);
        }
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    
      const lastMenu = await this.menuService.getLastMenu(user.id);
      if (lastMenu) {
        await this.sendMainMenu(ctx, lastMenu.id);
      } else {
        await this.sendMainMenu(ctx, null);
      }
    } catch (error) {
      console.error('[BotService] Ошибка в обработке команды /start:', error);
      await this.notifyAdmin(error, 'Ошибка в обработке команды /start'); 

      try {
        // Текст для пользователя на японском
        await ctx.reply('エラーが発生しました。後でもう一度お試しください。');
        console.error('вывод юзеру текст про ошибку');
        await this.notifyAdmin(error, 'вывод юзеру текст про ошибку');

      } catch (replyError) {
        console.error('[BotService] Ошибка при отправке сообщения об ошибке: 1', replyError);
        await this.notifyAdmin(replyError, 'Ошибка при отправке сообщения об ошибке:');

      }
    }
  }
  /*
   * Обработка текстового сообщения
   */
  private async handleTextMessage(ctx: any) {
    try {
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
      // Получаем объект верификации для пользователя или инициализируем его с 3 попытками
      let userVerification = this.emailVerification.get(user.id);
      if (!userVerification) {
        userVerification = { code: '', attempts: 3 };
        this.emailVerification.set(user.id, userVerification);
      }
    
      // Если введённый текст не является корректным email
      if (!this.validateEmail(text)) {
        // Уменьшаем количество попыток
        userVerification.attempts--;
        this.emailVerification.set(user.id, userVerification);
        
        // Если попытки закончились (<= 0)
        if (userVerification.attempts <= 0) {
          // Обновляем состояние пользователя на "start" и удаляем запись
          await this.usersService.updateUserStateActive(user.id, 'start');
          this.emailVerification.delete(user.id);
          await ctx.reply('試行回数の上限に達しました。メニューから選択してください🚀');
          // await ctx.reply('Попытки исчерпаны. Выберите что-то из меню');
          await this.sendMainMenu(ctx, null);
        } else {
          // Если ещё остались попытки – сообщаем об этом пользователю
          // await ctx.reply(`Некорректный email. Осталось ${userVerification.attempts} попыток.Пожалуйста, введите правильный email.`);
          await ctx.reply(`;おっと！そのメールアドレスは無効のようです。${userVerification.attempts} .キーボードの誤入力がないか、もう一度ご確認ください。.`)
          
        }
        return;
      }
    
      // http://localhost:3123/api/feedback
      // Если email корректный, генерируем код и отправляем его
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      try {
        const response = await axios.post('http://194.36.179.168:3123/api/feedback', {
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
        await this.notifyAdmin(error, 'Ошибка при отправке email:');

        // await ctx.reply('Произошла ошибка при отправке кода на ваш email. Попробуйте позже.');
        await ctx.reply('コードをメールに送信する際にエラーが発生しました。後でもう一度お試しください');
        return;
      }
      
      // Обновляем email и активируем получение новостей
      await this.usersService.updateEmailAndActivateNews(user.id, text);
      // await ctx.reply('Спасибо! Ваш email сохранен, новости активированы.');
      await ctx.reply('ありがとうございます！メールアドレスが保存され、ニュースレターが有効になりました。');
      
      
      // Сохраняем сгенерированный код и сбрасываем счётчик попыток (на 3)
      this.emailVerification.set(user.id, { code, attempts: 3 });
      
      // Переводим пользователя в состояние ожидания ввода кода
      await this.usersService.updateUserState(user.id, 'awaiting_code');
      // await ctx.reply('Пожалуйста, введите код, который был отправлен на ваш email:');
      await ctx.reply('あなたの秘密のコードが待っています！ ✨メールをチェックして、魔法の数字を手に入れましょう。');
      
      return;
    }

    // Если пользователь находится в состоянии ожидания кода
    if (user.state === 'awaiting_code') {
      const verification = this.emailVerification.get(user.id);
      if (!verification) {
        // Если данных нет, просим ввести email заново
        await this.usersService.updateUserState(user.id, 'awaiting_email');
        // await ctx.reply('Произошла ошибка. Пожалуйста, введите ваш email снова:');
        await ctx.reply('エラーが発生しました。もう一度メールアドレスを入力してください。');
        return;
      }
      

      if (text === verification.code) {
        // Код введён верно, обновляем состояние пользователя
        await this.usersService.updateUserState(user.id, 'email_getted');
        await ctx.reply('コードが確認されました！メールアドレスが認証され、ニュース配信が有効になりました。');
        // Удаляем данные верификации
        this.emailVerification.delete(user.id);
        await this.sendNewsToUser(ctx, user.id);

      } else {
        // Код неверный, уменьшаем количество попыток
        verification.attempts--;
        if (verification.attempts > 0) {
          // await ctx.reply(`Неверный код. Осталось ${verification.attempts} попыток. Пожалуйста, попробуйте снова:`);
          await ctx.reply(`おっと！そのメールアドレスは無効のようです。${verification.attempts}キーボードの誤入力がないか、もう一度ご確認ください。`);
        } else {
          // await ctx.reply('Вы исчерпали все попытки. Пожалуйста, введите ваш email снова:');
          await ctx.reply('試行回数の上限に達しました。もう一度メールアドレスを入力してください。');
          // Сбрасываем состояние и удаляем данные верификации
          await this.usersService.updateUserState(user.id, 'awaiting_email');
          this.emailVerification.delete(user.id);
        }
      }
      return;
    }

    // text === '⬅️ Назад' Если пользователь нажал 
    if (text === '⬅️ 戻る') {
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
                // keyboard.push([{ text: '⬅️ Назад' }]); // Добавляем кнопку "Назад" ⬅️ 戻る
                keyboard.push([{ text: '⬅️ 戻る' }]); // Добавляем кнопку "Назад" ⬅️ 戻る

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
        await this.sendMainMenu(ctx, userId); // Возвращаемся в главное меню, если родительского меню нет
        return;
    }

    // Получаем главное меню
    const menus = await this.menuService.getMainMenu();
    const selectedMenu = menus.find((menu) => menu.name === text);

    if (!selectedMenu) {
        console.log('[BotService] Меню не найдено для текста:', text);
        // await ctx.reply('Некорректный выбор. Попробуйте снова. 239');
        await ctx.reply('データが正しくありません。');
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
        keyboard.push([{ text: '⬅️ 戻る' }]); // Добавляем кнопку "Назад"
        // keyboard.push([{ text: '⬅️ Назад' }]); // Добавляем кнопку "Назад"

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
        // await ctx.reply('Нет связанных данных для этого меню.');このメニューに関連するデータがありません。
        await ctx.reply('このメニューに関連するデータがありません。');
    }
  }catch (error) {
    await this.notifyAdmin(error, "Ошибка при отправке сообщения об ошибке 2");
    console.error('[BotService] Ошибка в обработке текстового сообщения 2:', error);
    try {
      await ctx.reply('エラーが発生しました。後でもう一度お試しください。');
    } catch (innerError) {
      console.error('[BotService] Ошибка при отправке сообщения об ошибке 2:', innerError);
      await this.notifyAdmin(innerError, "Ошибка при отправке сообщения об ошибке 2");

    }
  }
}
  /*
   * Обработка инлайн-кнопок
   */
  private async handleCallbackQuery(ctx: any) {
    try{

   
    const callbackQuery = ctx.callbackQuery;
    const callbackData = callbackQuery?.data;
  
    if (!callbackData) {
      console.log('[BotService] Callback без данных');
      await ctx.answerCbQuery('データが正しくありません。');
      // await ctx.answerCbQuery('Некорректные данные');
      return;
    }

    // Пытаемся распарсить callbackData как ID кнопки
    const buttonId = parseInt(callbackData, 10);
    if (isNaN(buttonId)) {
      console.log('[BotService] Некорректный ID кнопки:', callbackData);
      await ctx.answerCbQuery('データが正しくありません。');
      // await ctx.answerCbQuery('Некорректные данные');
      return;
    }
  
    console.log(`[BotService] Нажата inline-кнопка с ID: ${buttonId}`);
    const button = await this.menuService.getButtonById(buttonId);
    if (!button) {
      // console.log(`Кнопка с ID=${buttonId} не найдена.`);ボタンが見つかりません。
      // await ctx.reply('Кнопка не найдена.');ボタンが見つかりません。
      await ctx.reply('ボタンが見つかりません。');
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
            
              // Формируем строку с названием категории, если она есть
              const categoryText = news.category ? `カテゴリー ${news.category.name}\n` : '';
            
              // Если у новости есть ссылка и заголовок для кнопки, формируем inline-клавиатуру
              const inlineKeyboard = (news.news_url && news.btn_title)
                ? { inline_keyboard: [[{ text: news.btn_title, url: news.news_url }]] }
                : undefined;
            
              if (news.post_image_url) {
                // Если есть изображение — отправляем фото с подписью
                await ctx.replyWithPhoto(news.post_image_url, {
                  caption: `${news.post_title}\n\n${news.post_content}\n\n${categoryText}`,
                  reply_markup: inlineKeyboard,
                });
              } else {
                // Иначе — отправляем обычное текстовое сообщение
                await ctx.reply(
                  `${news.post_title}\n\n${news.post_content}\n\n${categoryText}`,
                  { reply_markup: inlineKeyboard }
                );
              }
              
              index++;
              if (index < newsItems.length) {
                setTimeout(sendNextNews, 2000);
              }
            };
            await sendNextNews();
          } else {
            // await ctx.reply('К сожалению, новостей по вашим категориям пока нет.');
            await ctx.reply('申し訳ありませんが、選択されたカテゴリーに関するニュースはまだありません。')
          }
          await ctx.answerCbQuery();
          return;
        } else {
          // await ctx.reply('Для получения новостей заполните опрос:');ニュースを受け取るには、アンケートにご回答ください。
          await ctx.reply('ニュースを受け取るには、アンケートにご回答ください。');
          // Логика опроса остается, если email не заполнен или новости не активированы
        }
      } else {
        // Если email отсутствует или новости не активированы – запускаем опрос (вместо показа новости)
        // Здесь запускается стандартная логика вопросов по категориям (ветка ниже)
        // Вы можете, например, сообщить, что опрос начнется
        // await ctx.reply('Для получения новостей заполните опрос:');ニュースを受け取るには、アンケートにご回答ください。
        await ctx.reply('ニュースを受け取るには、アンケートにご回答ください。');
        // Затем можно вызвать функцию обработки опросных кнопок (например, ниже, если button.categorySportId != 0)
        // Или просто продолжить выполнение кода ниже
        // В данном примере мы не делаем return, чтобы дальше выполнялась ветка с обработкой опросных кнопок
      }
    }
    
    // Новый код для обработки опроса подписок:
    if (button.categorySportId) {
      const userId = ctx.from.id;
      const categoryId = button.categorySportId; // ID из news_category
      const isYes = button.name.includes('✅'); // Определяем, подписывается ли пользователь
      
      // Обновляем подписку через новый сервис
      await this.userNewsCategoryService.updateSubscription(userId, categoryId, isYes);
      
      await ctx.reply(isYes ? '✅' : '❌');
      
      const maxCategoryId = await this.menuService.getMaxCategorySportId();
      if (categoryId === maxCategoryId) {
        await this.usersService.updateUserState(userId, 'awaiting_email');
        // await ctx.reply('Спасибо за ответы!');ご回答ありがとうございます！
        await ctx.reply('ご回答ありがとうございます！');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // await ctx.reply('Подтвердите свой выбор категории. Мы пришлем Вам код на почту.');カテゴリーの選択を確認してください。コードをメールに送信します。
        await ctx.reply('カテゴリーの選択を確認してください。コードをメールに送信します。');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // await ctx.reply('Введите свой email:');メールアドレスを入力してください：
        await ctx.reply('メールアドレスを入力してください：');
        await ctx.answerCbQuery();
        return;
      }
      
      await ctx.answerCbQuery();
    }
    // Если у кнопки есть внешний URL – отправляем его
    if (button.url) {
      console.log(`[BotService] У кнопки есть внешний URL: ${button.url}`);
      // await ctx.reply(`Вот ваша ссылка: ${button.url}`);こちらがリンクです：
      await ctx.reply(`こちらがリンクです：${button.url}`);
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
    // await ctx.reply('Нет данных для отображения по этой кнопке.');
    await ctx.reply('このボタンに表示するデータがありません。');

    await ctx.answerCbQuery();
  }catch (error) {
    console.error("Обработка инлайн-кнопок", error);
    await this.notifyAdmin(error, "Обработка инлайн-кнопок");

    try {
      await ctx.reply("エラーが発生しました。後でもう一度お試しください。");
    } catch (replyError) {
      console.error("Обработка инлайн-кнопок user", replyError);
      await this.notifyAdmin(replyError, "Обработка инлайн-кнопок user");

    }
  }
}
  /*
   * Логика обработки поста
   */
  private async handlePost(ctx: any, postId: number) {
    try {
    console.log(`[BotService] Обрабатываем пост с ID: ${postId}`);
    const post = await this.menuService.getPostById(postId);
    if (!post) {
      // await ctx.reply('Пост не найден.');
      await ctx.reply('投稿が見つかりません。');
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
  }catch (error) {
    console.error('обработки поста', error);
    await this.notifyAdmin('обработки поста', error);

    try {
      await ctx.reply('エラーが発生しました。後でもう一度お試しください。');
    } catch (innerError) {
      console.error(innerError, 'обработки поста user', );
      await this.notifyAdmin( innerError, 'обработки поста user',);
    }
  }
}
  /*
  * Отправка главного меню с возможностью фильтрации по parentId
  */
  private async sendMainMenu(ctx: any, parentId?: number) {

    try {
    const menus = await this.menuService.getMainMenu();
    const keyboard = menus.map((menu) => [{ text: menu.name }]);

    await ctx.reply('ボタンを選択👇', {
      reply_markup: { keyboard, resize_keyboard: true, one_time_keyboard: false },
    });
  } catch (error) {
    console.error('Отправка главного меню с возможностью фильтрации по parentId', error);
    await this.notifyAdmin(error, 'Отправка главного меню с возможностью фильтрации по parentId');

    try {
      await ctx.reply('エラーが発生しました。後でもう一度お試しください。');
    } catch (innerError) {
      console.error('Отправка главного меню с возможностью фильтрации по parentId user', innerError);
      await this.notifyAdmin(innerError, 'Отправка главного меню с возможностью фильтрации по parentId user');

    }
  }
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
  private async sendNewsToUser(ctx: any, userId: number): Promise<void> {
    try{
    // Получаем подписки как массив имен категорий
    const subscribedCategories = await this.userNewsCategoryService.getSubscriptions(userId);
    // Получаем новости по этим категориям
    const newsItems = await this.userServiceNews.getNewsByCategories(subscribedCategories);
    if (newsItems.length > 0) {
      let index = 0;
      const sendNextNews = async () => {
        const news = newsItems[index];
        const messageText = `${news.post_title}\n\n${news.post_content}\n\n${news.news_url || ''}`;
        
        try {
          if (news.post_image_url) {
            await ctx.replyWithPhoto(news.post_image_url, {
              caption: messageText,
            });
          } else {
            await ctx.reply(messageText);
          }
        } catch (error) {
          // Если при отправке фото произошла ошибка (например, неправильный тип контента),
          // логируем ошибку и отправляем fallback-текстовое сообщение
          console.error('Ошибка отправки фото, используем fallback:', error);
          await this.notifyAdmin(error, 'Ошибка отправки фото, используем fallback:');
          await ctx.reply(messageText);
        }
        
        index++;
        if (index < newsItems.length) {
          setTimeout(sendNextNews, 2000);
        }
      };
      await sendNextNews();
    } else {
      await ctx.reply('申し訳ありませんが、選択されたカテゴリーに関するニュースはまだありません。');
    }
  }catch (error) {
    console.error('меню подписки на новости', error);
    await this.notifyAdmin(error, 'меню подписки на новости');

    try {
      await ctx.reply('エラーが発生しました。後でもう一度お試しください。');
    } catch (innerError) {
      console.error('меню подписки на новости UsersService', innerError);
      await this.notifyAdmin(innerError, `меню подписки на новости UsersService` );

    }
  }
}
  /*
  * отправка пуша 
  */
  async sendMessage(chatId: number, payload: { text?: string; imageUrl?: string; buttonName?: string; buttonUrl?: string }): Promise<boolean> {
    const { text, imageUrl, buttonName, buttonUrl } = payload;

    try {
      if (!text && !imageUrl) {
        throw new Error('Сообщение не может быть пустым');
      }

      const replyMarkup = buttonName && buttonUrl ? {
        inline_keyboard: [[{ text: buttonName, url: buttonUrl }]],
      } : undefined;

      if (imageUrl && text) {
        await this.bot.telegram.sendPhoto(chatId, imageUrl, {
          caption: text,
          reply_markup: replyMarkup,
        });
      } else if (imageUrl) {
        await this.bot.telegram.sendPhoto(chatId, imageUrl, {
          reply_markup: replyMarkup,
        });
      } else if (text) {
        await this.bot.telegram.sendMessage(chatId, text, {
          reply_markup: replyMarkup,
        });
      }

      console.log(`Сообщение успешно отправлено пользователю ${chatId}`);
      return true;
    } catch (error) {
      if (error.response?.error_code === 400 && error.response?.description === 'Bad Request: chat not found') {
        console.warn(`Чат с пользователем ${chatId} не найден, возможно, пользователь не начинал диалог или заблокировал бота`);
      } else {
        console.error(`Ошибка при отправке сообщения пользователю ${chatId}:`, error);
      }
      return false; // Возвращаем false, чтобы указать на неудачу
    }
  }

  /*
  * отправка админу про ошибку уведомление  
  */
  private async notifyAdmin(error: any, message?: string): Promise<void> {
    const errorMessage = `Ошибка в боте: ${error?.message || JSON.stringify(error)} - ${message ? `(${message})` : ''}`;
    try {
      await this.bot.telegram.sendMessage(this.adminChatId, errorMessage);
    } catch (sendError) {
      console.error('[BotService] Не удалось отправить сообщение администратору:', sendError);
      await this.notifyAdmin(error);

    }
  }
}