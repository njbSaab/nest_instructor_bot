import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreetingBot } from '../../entities/greeting-bot.entity';

@Injectable()
export class GreetingBotService {
  constructor(
    @InjectRepository(GreetingBot)
    private readonly greetingBotRepository: Repository<GreetingBot>,
  ) {}

  // Получить последнее приветствие
  async getGreeting(): Promise<GreetingBot> {
    const greeting = await this.greetingBotRepository.findOne({
      order: { id: 'DESC' }, // Последняя запись
    });
    if (!greeting) {
      throw new Error('Приветственное сообщение не найдено.');
    }
    return greeting;
  }

  // Новый метод: Получить все приветствия
  async getAllGreetings(): Promise<GreetingBot[]> {
    return await this.greetingBotRepository.find({
      order: { id: 'ASC' }, // Последовательность по ID
    });
  }
}