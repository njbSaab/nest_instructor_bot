import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity'; // Сущность пользователя

@Injectable()
export class StartService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async handleStart(ctx: Context) {
    const userInfo = ctx.from; // Извлекаем информацию из контекста Telegram

    // Формируем данные пользователя
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
      // Если пользователь новый, сохраняем его
      user = this.userRepository.create(userData);
      await this.userRepository.save(user);
      console.log('Новый пользователь сохранён:', user);
    } else {
      // Если пользователь существует, обновляем его данные
      user.started_at = new Date();
      user.state = 'menu';
      user.username = userData.username;
      user.first_name = userData.first_name;
      user.last_name = userData.last_name;
      user.language_code = userData.language_code;
      await this.userRepository.save(user);
      console.log('Информация о пользователе обновлена:', user);
    }

    // Отправляем приветственное сообщение и главное меню
    await ctx.reply(`👋 Добро пожаловать, ${userData.first_name}!\n`);
    await this.sendMainMenu(ctx);
  }

  // Метод отправки главного меню
  private async sendMainMenu(ctx: Context) {
    await ctx.reply(  '📋 Здесь вы можете выбрать, что Вас интересует!\n\n' +
      '📖 Инструкция\n' +
      '💳 Оплата\n' +
      '❓ Помощь\n' +
      '🎁 Промо', {
      reply_markup: {
        keyboard: [
          [{ text: '📖 Инструкция' }],
          [{ text: '💳 Оплата' }],
          [{ text: '❓ Помощь' }, { text: '🎁 Промо' }],
        ],
        resize_keyboard: true,
      },
    });
  }
}