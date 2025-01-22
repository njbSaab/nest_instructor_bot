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
      where: {}, // Указываем пустое условие, чтобы выбрать первую запись
      order: { id: 'DESC' }, // Последняя запись
    });
  
    if (!greeting) {
      throw new Error('Приветственное сообщение не найдено.');
    }
  
    return greeting;
  }
}