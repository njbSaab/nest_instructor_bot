import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuTable } from './menu-tables.entity';

@Entity('menu_posts')
export class MenuPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  post_title: string;

  @Column({ type: 'text' })
  post_content: string;

  @Column()
  menuId: number; // Поле для связи

  @ManyToOne(() => MenuTable)
  menu: MenuTable;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}