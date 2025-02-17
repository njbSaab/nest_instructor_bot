import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { BotService } from '../bot.service';

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly botService: BotService,
  ) {}

  async sendPushToAllUsers(message: string): Promise<void> {
    // Получаем всех пользователей
    const users = await this.usersService.getAllUsers();
    for (const user of users) {
      // Предполагается, что у пользователя id — это chatId в Telegram
      await this.botService.sendMessage(user.id, message);
    }
  }
}