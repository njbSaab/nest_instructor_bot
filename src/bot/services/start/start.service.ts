import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity'; // Сущность пользователя
import { MenuButton } from '../../entities/menu-button.entity'; // Сущность кнопки

@Injectable()
export class StartService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}

  async handleStart(ctx: Context) {
    // Сохраняем или обновляем данные пользователя в базе
    await this.saveUser(ctx);

    // Отправляем главное меню
    await ctx.reply('📋 Главное меню:', {
      reply_markup: {
        keyboard: await this.generateKeyboard(),
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    });
  }

  private async saveUser(ctx: Context) {
    const userInfo = ctx.from; // Информация о пользователе из Telegram

    // Формируем данные для нового пользователя
    const userData = {
      id: userInfo.id,
      username: userInfo.username || null,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name || null,
      language_code: userInfo.language_code || null,
      started_at: new Date(),
      state: 'menu', // Начальное состояние
    };

    // Проверяем, существует ли пользователь в базе данных
    let user = await this.userRepository.findOne({ where: { id: userData.id } });

    if (!user) {
      // Если пользователь новый, добавляем его в базу
      user = this.userRepository.create(userData);
      await this.userRepository.save(user);
      console.log('Новый пользователь добавлен:', user);
    } else {
      // Если пользователь уже существует, обновляем его данные
      user.started_at = new Date();
      user.state = 'menu';
      user.username = userData.username;
      user.first_name = userData.first_name;
      user.last_name = userData.last_name;
      user.language_code = userData.language_code;
      await this.userRepository.save(user);
      console.log('Информация о пользователе обновлена:', user);
    }
  }

  private async generateKeyboard() {
    console.log('Получаем все кнопки из базы данных...');

    // Получаем все кнопки из базы данных
    const allButtons = await this.menuButtonRepository.find({
        order: { row_order: 'ASC', column_order: 'ASC' },
    });

    console.log('Кнопки из базы данных:', allButtons);

    // Фильтруем только кнопки верхнего уровня
    const topLevelButtons = allButtons.filter((button) => button.parent_id === null);

    console.log('Кнопки верхнего уровня:', topLevelButtons);

    // Группируем кнопки верхнего уровня по row_order
    const groupedButtons = topLevelButtons.reduce((acc, button) => {
        if (!acc[button.row_order]) {
            acc[button.row_order] = [];
        }
        acc[button.row_order].push({ text: button.name });
        return acc;
    }, {});

    // Преобразуем в массив массивов для клавиатуры Telegraf
    const keyboard = Object.keys(groupedButtons)
        .sort((a, b) => Number(a) - Number(b)) // Сортируем строки по row_order
        .map((row) => groupedButtons[row]);

    console.log('Сформированная клавиатура:', keyboard);

    return keyboard;
}
}