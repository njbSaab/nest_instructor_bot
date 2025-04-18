import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsUser } from '../../entities/news-user.entity';

@Injectable()
export class NewsUserService {
  constructor(
    @InjectRepository(NewsUser)
    private readonly newsUserRepository: Repository<NewsUser>,
  ) {}

  async getAllNews(): Promise<NewsUser[]> {
    return this.newsUserRepository.find();
  }

  async getNewsById(id: number): Promise<NewsUser> {
    const news = await this.newsUserRepository.findOneBy({ id });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async updateNews(id: number, updateData: Partial<NewsUser>): Promise<NewsUser> {
    const news = await this.getNewsById(id);
    Object.assign(news, updateData);
    return this.newsUserRepository.save(news);
  }
    // Новый метод создания новости
    async createNews(createData: Partial<NewsUser>): Promise<NewsUser> {
      const news = this.newsUserRepository.create(createData);
      return this.newsUserRepository.save(news);
    }
  
    // Новый метод удаления новости
    async deleteNews(id: number): Promise<void> {
      const result = await this.newsUserRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`News with ID ${id} not found`);
      }
    }
}