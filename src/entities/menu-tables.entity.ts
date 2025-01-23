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

@Entity('menu_tables')
export class MenuTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', nullable: true })
  parentId: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'linkedPostId' })
  linked_post: MenuPost;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}