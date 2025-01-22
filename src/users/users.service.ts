import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateUser(userData: Partial<User>): Promise<User> {
    let user = await this.userRepository.findOne({ where: { id: userData.id } });

    if (!user) {
      user = this.userRepository.create({ ...userData, state: 'start' });
      await this.userRepository.save(user);
      console.log('[UsersService] Новый пользователь добавлен:', user);
    } else {
      console.log('[UsersService] Пользователь найден:', user);
    }

    return user;
  }
}