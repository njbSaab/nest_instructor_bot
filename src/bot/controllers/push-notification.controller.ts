import { Controller, Post, Body } from '@nestjs/common';
import { PushNotificationService } from '../services/push-notification.service';

@Controller('push')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post()
  async pushMessage(@Body('message') message: string) {
    await this.pushNotificationService.sendPushToAllUsers(message);
    return { success: true, message: 'Push уведомление отправлено' };
  }
}