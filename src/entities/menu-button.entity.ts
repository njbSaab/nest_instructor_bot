import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MenuPost } from './menu-posts.entity';

@Entity('menu_buttons')
export class MenuButton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ['keyboard', 'inline'] })
  type: 'keyboard' | 'inline';

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'postId' })
  post: MenuPost;

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nextPostId' })
  next_post: MenuPost;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}