import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';
import { MenuButton } from '../../entities/menu-button.entity';
import { MenuPost } from '../../entities/menu-posts.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuTable)
    private readonly menuTableRepository: Repository<MenuTable>,
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
    @InjectRepository(MenuPost)
    private readonly menuPostRepository: Repository<MenuPost>, // Исправляем здесь
  ) {}

  async getButtonsForMenu(menuId: number): Promise<MenuButton[]> {
    return this.menuButtonRepository.find({
      where: { menu: { id: menuId } },
      order: { order: 'ASC' },
    });
  }

  async getMainMenu(): Promise<MenuTable[]> {
    const menus = await this.menuTableRepository.find({ order: { order: 'ASC' } });
    console.log('[MenuService] Главное меню:', menus);
    return menus;
  }
  
  async getPostForMenu(menuId: number): Promise<MenuPost | null> {
    console.log(`[MenuService] Ищем пост для menuId: ${menuId}`);
    const post = await this.menuPostRepository.findOne({ where: { menuId } });
    console.log('[MenuService] Найден пост:', post);
    return post;
  }

  async getInlineButtonsForMenu(menuId: number): Promise<MenuButton[]> {
    console.log(`[MenuService] Ищем inline-кнопки для menuId: ${menuId}`);
    const buttons = await this.menuButtonRepository.find({
      where: { menu: { id: menuId }, type: 'inline' },
      order: { order: 'ASC' },
    });
    console.log('[MenuService] Найдены кнопки:', buttons);
    return buttons;
  }
  async getButtonById(buttonId: number): Promise<MenuButton | null> {
    const button = await this.menuButtonRepository.findOne({ where: { id: buttonId } });
    console.log(`[MenuService] Найдена кнопка с ID=${buttonId}:`, button);
    return button;
  }
}