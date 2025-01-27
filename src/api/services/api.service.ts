import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';
import { MenuPost } from '../../entities/menu-posts.entity';
import { MenuButton } from '../../entities/menu-button.entity';
import { MenuPostButton } from '../../entities/menu-post-button.entity';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(MenuTable)
    private readonly menuTableRepository: Repository<MenuTable>,
    @InjectRepository(MenuPost)
    private readonly menuPostRepository: Repository<MenuPost>,
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
    @InjectRepository(MenuPostButton)
    private readonly menuPostButtonRepository: Repository<MenuPostButton>,
  ) {}

  // Получить все меню
  async getAllMenuTables() {
    return this.menuTableRepository.find({ relations: ['linked_post'] });
  }

  // Получить все кнопки
  async getAllMenuButtons() {
    return this.menuButtonRepository.find();
  }

  // Получить все посты
  async getAllMenuPosts() {
    return this.menuPostRepository.find({
      relations: ['buttons', 'buttons.button'],
    });
  }

  // Получить все связи между постами и кнопками
  async getAllPostButtons() {
    return this.menuPostButtonRepository.find({
      relations: ['post', 'button'],
    });
  }
}