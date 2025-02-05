import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { GreetingBotService } from '../services/greeting-bot.service';
import { GreetingBot } from '../../entities/greeting-bot.entity';

@Controller('api/greetings')
export class GreetingController {
  constructor(private readonly greetingBotService: GreetingBotService) {}

  @Get()
  async getAllGreetings(): Promise<GreetingBot[]> {
    return this.greetingBotService.getAllGreetings();
  }

  @Get(':id')
  async getGreetingById(@Param('id') id: number): Promise<GreetingBot> {
    const greeting = await this.greetingBotService.getGreetingById(id);
    if (!greeting) {
      throw new NotFoundException(`Greeting with ID ${id} not found`);
    }
    return greeting;
  }

  @Put(':id')
  async updateGreeting(
    @Param('id') id: number,
    @Body() updateData: Partial<GreetingBot>,
  ): Promise<GreetingBot> {
    return this.greetingBotService.updateGreeting(id, updateData);
  }
}