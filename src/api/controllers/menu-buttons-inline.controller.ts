import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { MenuButtonInlineService } from '../services/menu-buttons-inline.service';
import { MenuButton } from '../../entities/menu-button.entity';

@Controller('api/menu-buttons-inline') // Use a distinct route
export class MenuButtonInlineController {
  constructor(private readonly menuButtonInlineService: MenuButtonInlineService) {}

  @Get()
  async getAllButtons(): Promise<MenuButton[]> { // Match the service return type
    return this.menuButtonInlineService.getAllButtons();
  }

  @Get(':id')
  async getButtonById(@Param('id', ParseIntPipe) id: number): Promise<MenuButton> {
    return this.menuButtonInlineService.getButtonById(id);
  }

  @Post()
  async createButton(@Body() buttonData: MenuButton): Promise<MenuButton> {
    return this.menuButtonInlineService.createButton(buttonData);
  }

  @Put(':id')
  async updateButton(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<MenuButton>,
  ): Promise<MenuButton> {
    return this.menuButtonInlineService.updateButton(id, updateData);
  }

  @Delete(':id')
  async deleteButton(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.menuButtonInlineService.deleteButton(id);
  }
}
