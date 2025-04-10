import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { BotService } from '../bot.service';

@Injectable()
export class PushNotificationService {
  constructor(
    private readonly botService: BotService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendPushToAllUsers(payload: { text?: string; imageUrl?: string; buttonName?: string; buttonUrl?: string }) {
    const users = await this.userRepository.find();
    console.log(`Найдено пользователей для отправки: ${users.length}`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      console.log(`Отправка сообщения пользователю ${user.id}`);
      const success = await this.botService.sendMessage(user.id, payload);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`Отправка завершена. Успешно: ${successCount}, Неудачно: ${failCount}`);
  }

  async sendPushToCategory(categoryId: number, payload: { text?: string; imageUrl?: string; buttonName?: string; buttonUrl?: string }) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.newsCategories', 'category', 'category.id = :categoryId', { categoryId })
      .getMany();

    console.log(`Найдено пользователей в категории ${categoryId}: ${users.length}`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      console.log(`Отправка сообщения пользователю ${user.id} в категории ${categoryId}`);
      const success = await this.botService.sendMessage(user.id, payload);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    console.log(`Отправка в категорию ${categoryId} завершена. Успешно: ${successCount}, Неудачно: ${failCount}`);
  }
}