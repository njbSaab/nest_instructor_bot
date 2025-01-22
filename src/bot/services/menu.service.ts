import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';
import { MenuButton } from '../../entities/menu-button.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuTable)
    private readonly menuTableRepository: Repository<MenuTable>,
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}

  async getMainMenu(): Promise<MenuTable[]> {
    return this.menuTableRepository.find({ order: { order: 'ASC' } });
  }

  async getButtonsForMenu(menuId: number): Promise<MenuButton[]> {
    return this.menuButtonRepository.find({ where: { menu: { id: menuId } }, order: { order: 'ASC' } });
  }
}