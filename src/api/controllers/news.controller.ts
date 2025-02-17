import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { NewsUserService } from '../services/news-user.service';
import { NewsUser } from '../../entities/news-user.entity';

@Controller('api/news')
export class NewsController {
  constructor(private readonly newsUserService: NewsUserService) {}

  @Get()
  async getAllNews(): Promise<NewsUser[]> {
    return this.newsUserService.getAllNews();
  }

  @Get(':id')
  async getNewsById(@Param('id') id: number): Promise<NewsUser> {
    return this.newsUserService.getNewsById(id);
  }

  @Put(':id')
  async updateNews(
    @Param('id') id: number,
    @Body() updateData: Partial<NewsUser>,
  ): Promise<NewsUser> {
    return this.newsUserService.updateNews(id, updateData);
  }
}