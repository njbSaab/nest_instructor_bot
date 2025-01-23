import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { MenuPost } from './menu-posts.entity';
  import { MenuButton } from './menu-button.entity';
  
  @Entity('menu_post_buttons')
  export class MenuPostButton {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => MenuPost, (post) => post.buttons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: MenuPost;
  
    @ManyToOne(() => MenuButton, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'buttonId' })
    button: MenuButton;
  }