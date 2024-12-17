import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class HelpService {
    async handleHelp(ctx: Context) {
        await ctx.reply('ℹ️ Доступные команды:\n/start - Начать\n/help - Помощь\n\nВыберите опцию из меню ниже.');
    }
}
