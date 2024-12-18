import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuButton } from '../../entities/menu-button.entity';

@Injectable()
export class KeyboardService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}

  async generateKeyboard(parentId: number, addBackButton = false): Promise<{ text: string }[][]> {
    console.log(`Получаем кнопки для parent_id: ${parentId}...`);

    const allButtons = await this.menuButtonRepository.find({
        where: { parent_id: parentId },
        order: { row_order: 'ASC', column_order: 'ASC' },
    });

    if (!allButtons.length) {
        console.log(`Нет кнопок для parent_id: ${parentId}.`);
        return [];
    }

    console.log(`Найдено ${allButtons.length} кнопок.`);

    const groupedButtons = allButtons.reduce((acc, button) => {
        const row = button.row_order || 9999; // Кнопки без row_order помещаем в конец
        if (!acc[row]) {
            acc[row] = [];
        }
        acc[row].push({ text: button.name });
        return acc;
    }, {});

    const keyboard = Object.keys(groupedButtons)
        .sort((a, b) => Number(a) - Number(b))
        .map((row) => groupedButtons[row]);

    // Добавляем кнопку "Назад", если это не главное меню
    if (addBackButton && parentId !== 1) {
        keyboard.push([{ text: '🔙 Назад' }]);
    }

    console.log(`Сформированная клавиатура для parent_id ${parentId}:`, keyboard);

    return keyboard;
   }
}