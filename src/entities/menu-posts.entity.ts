import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MenuTable } from './menu-tables.entity';
import { MenuPostButton } from './menu-post-button.entity';

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

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nextPostId' })
  next_post: MenuPost;

  @ManyToOne(() => MenuTable, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentMenuId' })
  parent_menu: MenuTable;

  @OneToMany(() => MenuPostButton, (postButton) => postButton.post, { cascade: true })
  buttons: MenuPostButton[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}