import { Controller } from '@nestjs/common';
import { MenuService } from '../services/menu.service';
import { Start, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    console.log('[MenuController] Команда /start получена.');
    
    const menus = await this.menuService.getMainMenu();
    // console.log('[MenuController] Главное меню загружено:', menus);
  
    const keyboard = menus.map((menu) => [{ text: menu.name }]);
  
    await ctx.reply('Выберите раздел:', {
      reply_markup: {
        keyboard,
        resize_keyboard: true,
      },
    });
    console.log('[MenuController] Главное меню отправлено пользователю.');
  }
}