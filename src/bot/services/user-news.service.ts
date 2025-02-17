import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NewsUser } from '../../entities/news-user.entity';

@Injectable()
export class UserNewsService {
  constructor(
    @InjectRepository(NewsUser)
    private readonly newsUserRepository: Repository<NewsUser>,
  ) {}

  async getNewsByCategories(subscribedCategories: string[]): Promise<NewsUser[]> {
    if (subscribedCategories.length === 0) return [];
    
    return this.newsUserRepository
      .createQueryBuilder('news')
      .innerJoinAndSelect('news.category', 'category')
      .where('category.name IN (:...categories)', { categories: subscribedCategories })
      .andWhere('news.isActive = :active', { active: true })
      .orderBy('news.created_at', 'DESC')
      .getMany();
  }
}