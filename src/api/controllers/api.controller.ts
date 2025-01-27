import { Controller, Get } from '@nestjs/common';
import { ApiService } from '../services/api.service';

@Controller('api/menu')
export class ApiController {
  constructor(private readonly menuService: ApiService) {}

  @Get('tables')
  async getMenuTables() {
    return this.menuService.getAllMenuTables();
  }

  @Get('buttons')
  async getMenuButtons() {
    return this.menuService.getAllMenuButtons();
  }

  @Get('posts')
  async getMenuPosts() {
    return this.menuService.getAllMenuPosts();
  }

  @Get('post-buttons')
  async getPostButtons() {
    return this.menuService.getAllPostButtons();
  }
}