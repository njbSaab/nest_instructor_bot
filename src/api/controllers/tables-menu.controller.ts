// src/api/controllers/menu-table.controller.ts
import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { MenuTableService } from '../services/tables-menu.service';
import { MenuTable } from '../../entities/menu-tables.entity';

@Controller('api/menu/tables')
export class MenuTableController {
  constructor(private readonly menuTableService: MenuTableService) {}

  @Get()
  async getAllMenuTables(): Promise<MenuTable[]> {
    return this.menuTableService.getAllMenuTables();
  }

  @Get(':id')
  async getMenuTableById(@Param('id') id: number): Promise<MenuTable> {
    return this.menuTableService.getMenuTableById(id);
  }

  @Put(':id')
  async updateMenuTable(
    @Param('id') id: number,
    @Body() updateData: Partial<MenuTable>,
  ): Promise<MenuTable> {
    return this.menuTableService.updateMenuTable(id, updateData);
  }
}