import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';
import { MenuButton } from '../../entities/menu-button.entity';
import { MenuPost } from '../../entities/menu-posts.entity';
import { MenuPostButton } from '../../entities/menu-post-button.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuTable)
    private readonly menuTableRepository: Repository<MenuTable>,
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
    @InjectRepository(MenuPost)
    private readonly menuPostRepository: Repository<MenuPost>,
    @InjectRepository(MenuPostButton)
    private readonly menuPostButtonRepository: Repository<MenuPostButton>, // Новая таблица связей
  ) {}

  // Получение главного меню
  async getMainMenu(): Promise<MenuTable[]> {
    const menus = await this.menuTableRepository.find({
      relations: ['linked_post'],
      order: { order: 'ASC' },
    });
    console.log('[MenuService] Загружено главное меню:', menus);
    return menus;
  }

  // Получение всех кнопок, связанных с постом через menu_post_buttons
  async getButtonsForPost(postId: number): Promise<MenuButton[]> {
    const buttons = await this.menuPostButtonRepository.find({
      where: { post: { id: postId } },
      relations: ['button'],
      order: { button: { order: 'ASC' } }, // Сортируем кнопки по полю order
    });
  
    console.log(`[MenuService] Кнопки для поста с ID=${postId}:`, buttons);
  
    return buttons.map((relation) => relation.button); // Возвращаем сами кнопки
  }

  // Получение поста по ID
  async getPostById(postId: number): Promise<MenuPost | null> {
    const post = await this.menuPostRepository.findOne({
      where: { id: postId },
      relations: ['next_post', 'parent_menu'],
    });
    console.log(`[MenuService] Пост с ID=${postId}:`, post);
    return post;
  }

  // Получение кнопки по ID
  async getButtonById(buttonId: number): Promise<MenuButton | null> {
    console.log(`[MenuService] Ищем кнопку с ID: ${buttonId}`);
    const button = await this.menuButtonRepository.findOne({
      where: { id: buttonId },
    });
    console.log(`[MenuService] Найдена кнопка:`, button);
    return button;
  }

  //получения поста, связанного с кнопкой через таблицу menu_post_buttons:
  async getPostByButtonId(buttonId: number): Promise<MenuPost | null> {
    console.log(`[MenuService] Ищем пост, связанный с кнопкой ID=${buttonId}`);
  
    const relation = await this.menuPostButtonRepository.findOne({
      where: { button: { id: buttonId } },
      relations: ['post'],
    });
  
    if (!relation) {
      console.log(`[MenuService] Пост не найден для кнопки ID=${buttonId}`);
      return null;
    }
  
    console.log(`[MenuService] Найден пост для кнопки ID=${buttonId}:`, relation.post);
    return relation.post;
  }

}