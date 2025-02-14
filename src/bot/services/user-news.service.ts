import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NewsUser } from '../../entities/news-user.entity'; // используйте относительный путь

@Injectable()
export class UserNewsService {
  constructor(
    @InjectRepository(NewsUser)
    private readonly newsUserRepository: Repository<NewsUser>,
  ) {}

  async getNewsByCategories(subscriptions: { football: boolean, basketball: boolean, box: boolean, ufc: boolean }): Promise<NewsUser[]> {
    // Собираем список категорий, на которые подписан пользователь
    const categories = [];
    if (subscriptions.football) categories.push('football');
    if (subscriptions.basketball) categories.push('basketball');
    if (subscriptions.box) categories.push('box');
    if (subscriptions.ufc) categories.push('ufc');
    
    if (categories.length === 0) return [];
    
    // Находим новости, которые соответствуют этим категориям и где isActive = true
    return this.newsUserRepository.find({
      where: { category: In(categories), isActive: true },
      order: { created_at: 'DESC' },
    });
  }
}