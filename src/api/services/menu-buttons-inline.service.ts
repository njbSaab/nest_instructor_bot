import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuButton } from '../../entities/menu-button.entity';

@Injectable()
export class MenuButtonInlineService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonInlineRepository: Repository<MenuButton>,
  ) {}

  async getAllButtons(): Promise<MenuButton[]> { 
    return this.menuButtonInlineRepository.find();
  }
  async getButtonById(id: number): Promise<MenuButton> {
    const button = await this.menuButtonInlineRepository.findOne({ where: { id } });
    if (!button) {
      throw new NotFoundException(`Button with ID ${id} not found`);
    }
    return button;
  }

  async createButton(buttonData: MenuButton): Promise<MenuButton> {
    const newButton = this.menuButtonInlineRepository.create(buttonData);
    return this.menuButtonInlineRepository.save(newButton);
  }

  async updateButton(id: number, updateData: Partial<MenuButton>): Promise<MenuButton> {
    const button = await this.getButtonById(id);
    Object.assign(button, updateData);
    return this.menuButtonInlineRepository.save(button);
  }

  async deleteButton(id: number): Promise<void> {
    const result = await this.menuButtonInlineRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Button with ID ${id} not found`);
    }
  }
}