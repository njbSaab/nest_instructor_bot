import { Injectable } from '@nestjs/common';
import { MenuService } from '../services/menu.service';

@Injectable()
export class PostHandler {
  constructor(private readonly menuService: MenuService) {}

  async handle(ctx: any, postId: number) {
    const post = await this.menuService.getPostById(postId);
    if (!post) {
      await ctx.reply('Пост не найден.');
      return;
    }

    const buttons = await this.menuService.getButtonsForPost(post.id);
    let messageText = post.post_content || '';

    if (post.post_image_url) {
      await ctx.replyWithPhoto(post.post_image_url, {
        caption: messageText,
        reply_markup: buttons.length
          ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
          : undefined,
      });
    } else {
      await ctx.reply(messageText, {
        reply_markup: buttons.length
          ? { inline_keyboard: buttons.map((button) => [{ text: button.name, callback_data: button.id.toString() }]) }
          : undefined,
      });
    }

    if (post.next_post) {
      await this.handle(ctx, post.next_post.id);
    }
  }
}