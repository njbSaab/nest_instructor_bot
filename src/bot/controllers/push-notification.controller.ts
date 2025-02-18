import { Controller, Post, Body, Query } from '@nestjs/common';
import { PushNotificationService } from '../services/push-notification.service';

@Controller('push')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post()
  async pushMessage(
    @Body('message') message: string,
    @Query('categoryId') categoryId?: string, // получаем как строку, если передан
  ) {
    if (categoryId) {
      const catId = parseInt(categoryId, 10);
      await this.pushNotificationService.sendPushToCategory(catId, message);
      return { success: true, message: `Push уведомление отправлено подписчикам категории ${catId}` };
    } else {
      await this.pushNotificationService.sendPushToAllUsers(message);
      return { success: true, message: 'Push уведомление отправлено всем пользователям' };
    }
  }
}