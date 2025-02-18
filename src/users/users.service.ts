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
  async updateUserState(userId: number, newState: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
  
    user.state = newState;
    return this.userRepository.save(user);
  }
  async updateUserNewsActiveStatus(userId: number, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`Пользователь с ID ${userId} не найден`);
    }
    user.isNewsActive = isActive;
    return this.userRepository.save(user);
  }

  async updateUserStateActive(userId: number, newState: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`Пользователь с ID ${userId} не найден`);
    }
    user.state = newState;
    
    // Если новое состояние "start", устанавливаем isNewsActive в false
    if (newState === 'start') {
      user.isNewsActive = false;
    }
    
    return this.userRepository.save(user);
  }


  async updateEmailAndActivateNews(userId: number, email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    user.email = email;
    user.isNewsActive = true;
    user.state = 'email_getted';
    return this.userRepository.save(user);
  }
    // Метод для получения всех пользователей
    async getAllUsers(): Promise<User[]> {
      return this.userRepository.find();
    }
  
}