import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  // Получение главного меню с возможностью фильтрации по parentId
  async getMainMenu(): Promise<MenuTable[]> {
    const menus = await this.menuTableRepository.find({
      where: {
        isActive: true, // Исключаем записи, у которых isActive=false
      },
      relations: ['linked_post'],
      order: { order: 'ASC' },
    });
  
    // console.log('[MenuService] Загружено главное меню:', menus);
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
  // Получение дочерних элементов меню по parentId
  async getMenuById(menuId: number): Promise<MenuTable | null> {
    const menu = await this.menuTableRepository.findOne({
      where: { id: menuId },
      relations: ['linked_post'],
    });
    console.log(`[MenuService] Меню с ID=${menuId}:`, menu);
    return menu;
  }
  async getSubMenusByParentId(parentId: number): Promise<MenuTable[]> {
    const subMenus = await this.menuTableRepository.find({
      where: { parentId, isActive: true }, // Добавлено условие isActive
      order: { order: 'ASC' },
    });
    console.log(`[MenuService] Дочерние элементы меню для parentId=${parentId}:`, subMenus);
    return subMenus;
  }
  private userSessions = new Map<number, { lastMenuId: number }>(); // Простая реализация хранения

async setLastMenu(userId: number, menuId: number): Promise<void> {
  this.userSessions.set(userId, { lastMenuId: menuId });
}

async getLastMenu(userId: number): Promise<MenuTable | null> {
  const session = this.userSessions.get(userId);
  if (session?.lastMenuId) {
    return this.getMenuById(session.lastMenuId);
  }
  return null;
}
// Обновление состояния пунктов меню по parentId
async updateMenuState(parentId: number, isActive: boolean): Promise<void> {
  await this.menuTableRepository.update(
    { parentId }, // Условие: все подменю с parentId
    { isActive }  // Обновляем состояние
  );
  console.log(`[MenuService] Обновлено состояние меню для parentId=${parentId}: isActive=${isActive}`);
}
}