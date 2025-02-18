import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsCategory } from '../../entities/news-category.entity';

@Controller('categories')
export class NewsCategoryController {
  constructor(
    @InjectRepository(NewsCategory)
    private readonly categoryRepository: Repository<NewsCategory>,
  ) {}

  // GET /categories – возвращает все категории
  @Get()
  async getAllCategories(): Promise<NewsCategory[]> {
    return this.categoryRepository.find();
  }
}