// src/bot/handlers/text-message.handler.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from '../../users/users.service';
import { MenuService } from '../services/menu.service';

@Injectable()
export class TextMessageHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly menuService: MenuService,
  ) {}

  async handle(ctx: any, emailVerification: Map<number, { code: string; attempts: number }>): Promise<void> {
    const text = ctx.message?.text;
    if (!text) {
      console.log('[TextMessageHandler] Сообщение без текста');
      return;
    }

    console.log(`[TextMessageHandler] Получено текстовое сообщение: "${text}"`);

    // Получаем пользователя
    const user = await this.usersService.findOrCreateUser(ctx.from);

    // Если пользователь находится в состоянии ожидания email
    if (user.state === 'awaiting_email') {
      if (!this.validateEmail(text)) {
        await ctx.reply('Некорректный email. Пожалуйста, введите правильный email:');
        return;
      }

      const code = Math.floor(10000 + Math.random() * 90000).toString();

      try {
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

      await this.usersService.updateEmailAndActivateNews(user.id, text);
      await ctx.reply('Спасибо! Ваш email сохранен, новости активированы.');
      emailVerification.set(user.id, { code, attempts: 3 });
      await this.usersService.updateUserState(user.id, 'awaiting_code');
      await ctx.reply('Пожалуйста, введите код, который был отправлен на ваш email:');
      return;
    }

    // Если пользователь находится в состоянии ожидания кода
    if (user.state === 'awaiting_code') {
      const verification = emailVerification.get(user.id);
      if (!verification) {
        await this.usersService.updateUserState(user.id, 'awaiting_email');
        await ctx.reply('Произошла ошибка. Пожалуйста, введите ваш email снова:');
        return;
      }

      if (text === verification.code) {
        await this.usersService.updateUserState(user.id, 'email_getted');
        await ctx.reply('Код подтвержден! Ваш email подтвержден, и новости активированы.');
        emailVerification.delete(user.id);
        // Здесь можно вызвать другую функцию для отображения вариантов подписки и т.д.
        await ctx.reply('Желаете получать новости?');
      } else {
        verification.attempts--;
        if (verification.attempts > 0) {
          await ctx.reply(`Неверный код. Осталось ${verification.attempts} попыток. Пожалуйста, попробуйте снова:`);
        } else {
          await ctx.reply('Вы исчерпали все попытки. Пожалуйста, введите ваш email снова:');
          await this.usersService.updateUserState(user.id, 'awaiting_email');
          emailVerification.delete(user.id);
        }
      }
      return;
    }

    // Если пользователь нажал "⬅️ Назад"
    if (text === '⬅️ Назад') {
      const userId = ctx.from.id;
      const lastMenu = await this.menuService.getLastMenu(userId);
      if (lastMenu?.id) {
        console.log(`[TextMessageHandler] Скрываем подменю для menuId=${lastMenu.id}`);
        await this.menuService.updateMenuState(lastMenu.id, false);
      }
      if (lastMenu?.parentId) {
        console.log(`[TextMessageHandler] Возвращаемся к родительскому меню с ID: ${lastMenu.parentId}`);
        const parentMenu = await this.menuService.getMenuById(lastMenu.parentId);
        if (parentMenu) {
          const subMenus = await this.menuService.getSubMenusByParentId(parentMenu.id);
          const keyboard = subMenus.map((submenu) => [{ text: submenu.name }]);
          keyboard.push([{ text: '⬅️ Назад' }]);
          await ctx.reply('ボタンを選択👇', {
            reply_markup: { keyboard, resize_keyboard: true },
          });
          await this.menuService.setLastMenu(userId, parentMenu.id);
          return;
        }
      }
      console.log('[TextMessageHandler] Нет родительского меню для возврата.');
      // Здесь можно вызвать публичный метод sendMainMenu, если он доступен из MenuService
      // Например: await this.menuService.sendMainMenu(ctx);
      return;
    }

    // Остальная логика обработки текстовых сообщений...
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}