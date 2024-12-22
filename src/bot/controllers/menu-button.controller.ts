//api for client
import { Controller, Get, Put, Body, Param, Post, Delete } from '@nestjs/common';
import { MenuButton } from '../entities/menu-button.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('api/buttons')
export class MenuButtonController {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}

  @Get()
  async getAllButtons(): Promise<MenuButton[]> {
    console.log('Получение всех кнопок...');
    const buttons = await this.menuButtonRepository.find({ order: { row_order: 'ASC', column_order: 'ASC' } });
    console.log(`Найдено кнопок: ${buttons.length}`);
    return buttons;
  }

  @Get(':id')
  async getButton(@Param('id') id: number): Promise<MenuButton> {
    console.log(`Получение кнопки с id: ${id}`);
    const button = await this.menuButtonRepository.findOneBy({ id });
    if (button) {
      console.log('Найдена кнопка:', button);
    } else {
      console.log(`Кнопка с id ${id} не найдена.`);
    }
    return button;
  }

  @Post()
  async createButton(@Body() buttonData: Partial<MenuButton>): Promise<MenuButton> {
    console.log('Создание новой кнопки с данными:', buttonData);
    const newButton = this.menuButtonRepository.create(buttonData);
    const savedButton = await this.menuButtonRepository.save(newButton);
    console.log('Создана кнопка:', savedButton);
    return savedButton;
  }

  @Put(':id')
  async updateButton(@Param('id') id: number, @Body() updateData: Partial<MenuButton>): Promise<MenuButton> {
    console.log(`Обновление кнопки с id: ${id}, данные:`, updateData);
    await this.menuButtonRepository.update(id, updateData);
    const updatedButton = await this.menuButtonRepository.findOneBy({ id });
    console.log('Обновленная кнопка:', updatedButton);
    return updatedButton;
  }

  @Delete(':id')
  async deleteButton(@Param('id') id: number): Promise<void> {
    console.log(`Удаление кнопки с id: ${id}`);
    await this.menuButtonRepository.delete(id);
    console.log(`Кнопка с id ${id} удалена.`);
  }
}