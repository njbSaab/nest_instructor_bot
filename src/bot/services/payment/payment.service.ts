import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuButton } from '../../entities/menu-button.entity'; // Сущность кнопки


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(MenuButton)
    private readonly menuButtonRepository: Repository<MenuButton>,
  ) {}
}