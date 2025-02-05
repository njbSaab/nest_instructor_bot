import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { MenuPostButtonsService } from '../services/menu-post-buttons.service';
import { MenuPostButton } from '../../entities/menu-post-button.entity';

@Controller('api/post-buttons')
export class MenuPostButtonsController {
  constructor(private readonly menuPostButtonsService: MenuPostButtonsService) {}

  @Get()
  async getAllPostButtons(): Promise<MenuPostButton[]> {
    return this.menuPostButtonsService.getAllPostButtons();
  }

  @Get(':id')
  async getPostButtonById(@Param('id') id: number): Promise<MenuPostButton> {
    return this.menuPostButtonsService.getPostButtonById(id);
  }

  @Put(':id')
  async updatePostButton(
    @Param('id') id: number,
    @Body() updateData: Partial<MenuPostButton>,
  ): Promise<MenuPostButton> {
    return this.menuPostButtonsService.updatePostButton(id, updateData);
  }
}