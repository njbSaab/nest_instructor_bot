//user-sports.controller.ts
import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { UserSportsService } from '../services/user-sports.service'

@Controller('user-sports')
export class UserSportsController {
  constructor(
    private readonly userSportsService: UserSportsService,
  ) {}

  /**
   * Пример GET-запроса:
   * GET /user-sports/123
   * Возвращаем текущие подписки пользователя с ID=123.
   */
  @Get(':userId')
  async getUserSports(@Param('userId') userId: number) {
    // Возвращаем (или создаём, если нет) запись
    return await this.userSportsService.findOrCreate(userId);
  }

  /**
   * Пример PATCH-запроса:
   * PATCH /user-sports/123
   * JSON: { categoryId: 1, subscribed: true }
   * Обновляет конкретный флаг (футбол = true, к примеру).
   */
  @Patch(':userId')
  async updateUserSport(
    @Param('userId') userId: number,
    @Body() body: { categoryId: number; subscribed: boolean },
  ) {
    await this.userSportsService.updateUserSport(userId, body.categoryId, body.subscribed);
    return { success: true };
  }
}