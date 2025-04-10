import { Controller, Post, Body, Query } from '@nestjs/common';
import { PushNotificationService } from '../services/push-notification.service';

@Controller('push')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post()
  async pushMessage(
    @Body() body: { text?: string; imageUrl?: string; buttonName?: string; buttonUrl?: string; categoryIds?: number[] },
    @Query('categoryId') categoryId?: string,
  ) {
    const { text, imageUrl, buttonName, buttonUrl } = body;

    // Валидация: минимум один элемент должен быть
    if (!text && !imageUrl) {
      throw new Error('Сообщение должно содержать хотя бы текст или изображение');
    }

    // Валидация: нельзя отправить только кнопку без текста
    if (!text && !imageUrl && (buttonName || buttonUrl)) {
      throw new Error('Кнопка не может быть отправлена без текста или изображения');
    }

    // Формируем сообщение для отправки
    const messagePayload = { text, imageUrl, buttonName, buttonUrl };
    console.log('Подготовлено сообщение для отправки:', messagePayload);

    if (categoryId) {
      const catId = parseInt(categoryId, 10);
      await this.pushNotificationService.sendPushToCategory(catId, messagePayload);
      return { success: true, message: `Push отправлен подписчикам категории ${catId}` };
    } else {
      await this.pushNotificationService.sendPushToAllUsers(messagePayload);
      return { success: true, message: 'Push отправлен всем пользователям' };
    }
  }
}