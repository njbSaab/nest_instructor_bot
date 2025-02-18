import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, ParseIntPipe } from '@nestjs/common';
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
  async getNewsById(@Param('id', ParseIntPipe) id: number): Promise<NewsUser> {
    return this.newsUserService.getNewsById(id);
  }

  @Post()
  async createNews(@Body() createData: Partial<NewsUser>): Promise<NewsUser> {
    return this.newsUserService.createNews(createData);
  }

  @Put(':id')
  async updateNews(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: Partial<NewsUser>,
  ): Promise<NewsUser> {
    return this.newsUserService.updateNews(id, updateData);
  }

  @Delete(':id')
  async deleteNews(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    await this.newsUserService.deleteNews(id);
    return { success: true };
  }
}