import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { NewsCategory } from '../../entities/news-category.entity';

@Injectable()
export class UserNewsCategoryService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(NewsCategory)
    private readonly categoryRepository: Repository<NewsCategory>,
  ) {}

  // Получаем подписки пользователя как массив имен категорий
  async getSubscriptions(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['newsCategories'],
    });
    if (!user || !user.newsCategories) {
      return [];
    }
    return user.newsCategories.map((cat) => cat.name);
  }

  // Подписывает пользователя на категорию по ID
  async subscribe(userId: number, categoryId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['newsCategories'],
    });
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!user || !category) {
      throw new Error('Пользователь или категория не найдены');
    }
    if (!user.newsCategories) {
      user.newsCategories = [];
    }
    // Если пользователь ещё не подписан – добавляем категорию
    if (!user.newsCategories.some((c) => c.id === category.id)) {
      user.newsCategories.push(category);
      await this.userRepository.save(user);
    }
  }

  // Отписывает пользователя от категории по ID
  async unsubscribe(userId: number, categoryId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['newsCategories'],
    });
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    user.newsCategories = user.newsCategories.filter((c) => c.id !== categoryId);
    await this.userRepository.save(user);
  }

  // Универсальный метод обновления подписки:
  // isSubscribed === true → подписываем, иначе отписываем
  async updateSubscription(userId: number, categoryId: number, isSubscribed: boolean): Promise<void> {
    if (isSubscribed) {
      await this.subscribe(userId, categoryId);
    } else {
      await this.unsubscribe(userId, categoryId);
    }
  }
}