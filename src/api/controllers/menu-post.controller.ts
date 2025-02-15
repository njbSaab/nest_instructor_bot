import { Controller, Get, Put, Param, Body, NotFoundException } from '@nestjs/common';
import { MenuPostService } from '../services/menu-post.service';
import { MenuPost } from '../../entities/menu-posts.entity';

@Controller('api/posts')
export class MenuPostController {
  constructor(private readonly menuPostService: MenuPostService) {}

  @Get()
  async getAllPosts(): Promise<any[]> {
    const posts = await this.menuPostService.getAllPosts();
    return posts.map(post => ({
      id: post.id,
      post_title: post.post_title,
      post_content: post.post_content,
      post_image_url: post.post_image_url,
      parent_menu: post.parent_menu || null, // <-- Теперь отправляем весь объект
      created_at: post.created_at,
      updated_at: post.updated_at,
      buttons: post.buttons,
    }));
  }
  @Get(':id')
  async getPostById(@Param('id') id: number): Promise<any> {
    const post = await this.menuPostService.getPostById(id);
    return {
      id: post.id,
      post_title: post.post_title,
      post_content: post.post_content,
      post_image_url: post.post_image_url,
      parent_menu: post.parent_menu || null, // <-- Теперь возвращаем ВЕСЬ ОБЪЕКТ
      created_at: post.created_at,
      updated_at: post.updated_at,
      buttons: post.buttons,
    };
  }
  
  @Put(':id')
  async updatePost(
    @Param('id') id: number,
    @Body() updateData: Partial<MenuPost>,
  ): Promise<MenuPost> {
    return this.menuPostService.updatePost(id, updateData);
  }
}