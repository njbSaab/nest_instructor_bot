import { Controller, Get } from '@nestjs/common';
import { GreetingBotService } from '../services/greeting-bot.service';

@Controller('greeting')
export class GreetingBotController {
  constructor(private readonly greetingBotService: GreetingBotService) {}

  // Эндпоинт для получения текущего приветствия
  @Get()
  async getGreeting() {
    return this.greetingBotService.getGreeting();
  }
}