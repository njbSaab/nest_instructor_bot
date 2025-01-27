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

  async getAllGreetings(): Promise<GreetingBot[]> {
    return this.greetingBotRepository.find();
  }

  async getGreetingById(id: number): Promise<GreetingBot> {
    return this.greetingBotRepository.findOneBy({ id });
  }

  async updateGreeting(id: number, updateData: Partial<GreetingBot>): Promise<GreetingBot> {
    const greeting = await this.greetingBotRepository.findOneBy({ id });

    if (!greeting) {
      throw new Error(`Greeting with ID ${id} not found`);
    }

    Object.assign(greeting, updateData);
    return this.greetingBotRepository.save(greeting);
  }
}