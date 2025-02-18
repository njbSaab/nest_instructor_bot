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

  // Отправка пуша всем пользователям
  async sendPushToAllUsers(message: string): Promise<void> {
    const users = await this.userRepository.find();
    for (const user of users) {
      await this.botService.sendMessage(user.id, message);
    }
  }

  // Отправка пуша только пользователям, подписанным на конкретную категорию
  async sendPushToCategory(categoryId: number, message: string): Promise<void> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.newsCategories', 'category', 'category.id = :categoryId', { categoryId })
      .getMany();
      
    for (const user of users) {
      await this.botService.sendMessage(user.id, message);
    }
  }
}