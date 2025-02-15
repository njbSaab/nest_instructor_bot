import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuPost } from '../../entities/menu-posts.entity';

@Injectable()
export class MenuPostService {
  constructor(
    @InjectRepository(MenuPost)
    private readonly menuPostRepository: Repository<MenuPost>,
  ) {}

  async getAllPosts(): Promise<MenuPost[]> {
    return this.menuPostRepository.find({ relations: ['buttons', 'parent_menu'] });
  }
  
  async getPostById(id: number): Promise<MenuPost> {
    const post = await this.menuPostRepository.findOne({
      where: { id },
      relations: ['buttons', 'parent_menu'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }
  // Обновить пост
  async updatePost(id: number, updateData: Partial<MenuPost>): Promise<MenuPost> {
    const post = await this.getPostById(id);
    Object.assign(post, updateData);
    return this.menuPostRepository.save(post);
  }
}