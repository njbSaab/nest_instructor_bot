import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';

@Injectable()
export class MessageService {
    async handleText(ctx: Context) {
        const text = ctx.message['text'];
    
        switch (text) {
          case '📖 Инструкция':
            await ctx.reply('📖 Это раздел "Инструкция". Здесь lorem ipsum...');
            break;
    
          case '💳 Оплата':
            await ctx.reply('💳 Раздел "Оплата": выберите способ оплаты.');
            break;
    
          case '❓ Помощь':
            await ctx.reply('❓ Это раздел "Помощь". Обратитесь в поддержку.');
            break;
    
          case '🎁 Промо':
            await ctx.reply('🎁 Это раздел "Промо". Нажмите кнопку ниже.');
            break;
    
          default:
            await ctx.reply('❌ Команда не распознана. Выберите раздел из меню.');
        }
      }
}
