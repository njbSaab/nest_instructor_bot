import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';
import { MenuButton } from '../../entities/menu-button.entity';
import { MenuPost } from '../../entities/menu-posts.entity';
import { Not, IsNull } from 'typeorm';

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

  async getMainMenu(): Promise<MenuTable[]> {
    const menus = await this.menuTableRepository.find({
      relations: ['linked_post'],
      order: { order: 'ASC' },
    });
    console.log('[MenuService] Загружено главное меню:', menus);
    return menus;
  }
  
  async getButtonsForPost(postId: number): Promise<MenuButton[]> {
    const buttons = await this.menuButtonRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
      order: { order: 'ASC' },
    });
    console.log(`[MenuService] Кнопки для поста с ID=${postId}:`, buttons);
    return buttons;
  }
  
  async getPostById(postId: number): Promise<MenuPost | null> {
    const post = await this.menuPostRepository.findOne({
      where: { id: postId },
      relations: ['next_post', 'parent_menu'],
    });
    console.log(`[MenuService] Пост с ID=${postId}:`, post);
    return post;
  }

  async getButtonById(buttonId: number): Promise<MenuButton | null> {
    console.log(`[MenuService] Ищем кнопку с ID: ${buttonId}`);
    const button = await this.menuButtonRepository.findOne({
      where: { id: buttonId },
      relations: ['post', 'next_post'], // Подгружаем связанные посты, если они есть
    });
    console.log(`[MenuService] Найдена кнопка:`, button);
    return button;
  }

}