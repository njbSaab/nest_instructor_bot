import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuButton } from './menu-button.entity';
import { MenuTable } from './menu-tables.entity';

@Entity('menu_posts')
export class MenuPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  post_title: string;

  @Column({ type: 'text', nullable: true })
  post_content: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  post_image_url: string;

  @ManyToOne(() => MenuButton, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentButtonId' })
  parent_button: MenuButton;

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nextPostId' })
  next_post: MenuPost;

  @ManyToOne(() => MenuTable, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentMenuId' })
  parent_menu: MenuTable;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}