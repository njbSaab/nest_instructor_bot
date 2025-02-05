import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { MenuPostService } from '../services/menu-post.service';
import { MenuPost } from '../../entities/menu-posts.entity';

@Controller('api/posts')
export class MenuPostController {
  constructor(private readonly menuPostService: MenuPostService) {}

  @Get()
  async getAllPosts(): Promise<MenuPost[]> {
    return this.menuPostService.getAllPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<MenuPost> {
    return this.menuPostService.getPostById(id);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: number,
    @Body() updateData: Partial<MenuPost>,
  ): Promise<MenuPost> {
    return this.menuPostService.updatePost(id, updateData);
  }
}