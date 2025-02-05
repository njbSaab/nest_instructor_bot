import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuPostButton } from '../../entities/menu-post-button.entity';

@Injectable()
export class MenuPostButtonsService {
  constructor(
    @InjectRepository(MenuPostButton)
    private readonly menuPostButtonRepository: Repository<MenuPostButton>,
  ) {}

  // Получение всех кнопок постов
  async getAllPostButtons(): Promise<MenuPostButton[]> {
    return this.menuPostButtonRepository.find({ relations: ['post'] });
  }

  // Получение кнопки по ID
  async getPostButtonById(id: number): Promise<MenuPostButton> {
    const button = await this.menuPostButtonRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!button) {
      throw new NotFoundException(`Button with ID ${id} not found`);
    }

    return button;
  }

  // Обновление кнопки поста
  async updatePostButton(id: number, updateData: Partial<MenuPostButton>): Promise<MenuPostButton> {
    const button = await this.getPostButtonById(id);
    Object.assign(button, updateData);
    return this.menuPostButtonRepository.save(button);
  }
}