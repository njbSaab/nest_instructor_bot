// src/api/services/menu-table.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuTable } from '../../entities/menu-tables.entity';

@Injectable()
export class MenuTableService {
  constructor(
    @InjectRepository(MenuTable)
    private readonly menuTableRepository: Repository<MenuTable>,
  ) {}

  // Получить все таблицы
  async getAllMenuTables(): Promise<MenuTable[]> {
    return this.menuTableRepository.find({ relations: ['linked_post'] });
  }

  // Получить таблицу по ID
  async getMenuTableById(id: number): Promise<MenuTable> {
    const table = await this.menuTableRepository.findOne({ where: { id } });
    if (!table) throw new NotFoundException(`Menu Table with ID ${id} not found`);
    return table;
  }

  // Обновить таблицу
  async updateMenuTable(id: number, updateData: Partial<MenuTable>): Promise<MenuTable> {
    const table = await this.getMenuTableById(id);
    Object.assign(table, updateData);
    return this.menuTableRepository.save(table);
  }
}