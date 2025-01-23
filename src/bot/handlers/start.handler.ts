import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { GreetingBotService } from '../services/greeting-bot.service';

@Injectable()
export class StartHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly greetingBotService: GreetingBotService,
  ) {}

  async handle(ctx: any) {
    console.log('[StartHandler] Получена команда /start');
    const user = await this.usersService.findOrCreateUser(ctx.from);
    console.log('[StartHandler] Пользователь добавлен/обновлён:', user);

    const greetings = await this.greetingBotService.getAllGreetings();
    for (const greeting of greetings) {
      const personalizedText = greeting.greeting_text.replace('[Name]', user.first_name || 'there');
      if (greeting.image_url) {
        await ctx.replyWithPhoto(greeting.image_url, { caption: personalizedText });
      } else {
        await ctx.reply(personalizedText);
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
}