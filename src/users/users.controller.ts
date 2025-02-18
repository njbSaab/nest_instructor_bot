import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // GET /users — возвращает всех пользователей
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }
  // GET /users/:id — возвращает пользователя по ID
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    // Здесь можно реализовать метод findOne, но для примера используем findOrCreateUser:
    return this.usersService.findOrCreateUser({ id });
  }
}