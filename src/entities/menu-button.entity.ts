import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { MenuPost } from './menu-posts.entity'; // Импортируем сущность MenuPost

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

  @Column({ type: 'int', nullable: true })
  categorySportId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Связь с постом
  @ManyToOne(() => MenuPost, { nullable: true }) // Связь с таблицей MenuPost
  @JoinColumn({ name: 'postId' }) // Указываем имя колонки в базе данных
  post?: MenuPost; // Связь с сущностью MenuPost (необязательная)
  
  @Column({ type: 'int', nullable: true })
  postId?: number; // Поле для хранения id поста
}