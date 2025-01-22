import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MenuTable } from './menu-tables.entity';
import { MenuPost } from './menu-posts.entity';

@Entity('menu_buttons')
export class MenuButton {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MenuTable, (menu) => menu.buttons, { onDelete: 'CASCADE' })
  menu: MenuTable; // Ссылка на раздел меню

  @ManyToOne(() => MenuButton, { nullable: true, onDelete: 'CASCADE' })
  parent_button: MenuButton; // Привязка к родительской кнопке (если это вложенная кнопка)

  @ManyToOne(() => MenuPost, { nullable: true, onDelete: 'SET NULL' })
  post: MenuPost; // Привязка к посту (если кнопка вызывает пост)

  @Column({ type: 'varchar', length: 255 })
  name: string; // Название кнопки

  @Column({ type: 'enum', enum: ['keyboard', 'inline'] })
  type: 'keyboard' | 'inline'; // Тип кнопки

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string; // Ссылка для инлайн-кнопок

  @Column({ type: 'int', default: 0 })
  order: number; // Порядок отображения

  @Column({ type: 'enum', enum: ['text', 'image', 'text_and_image'], default: 'text' })
  response_type: 'text' | 'image' | 'text_and_image'; // Тип ответа

  @Column({ type: 'text', nullable: true })
  response_text: string; // Ответный текст

  @Column({ type: 'varchar', length: 255, nullable: true })
  response_image_url: string; // Ссылка на изображение для ответа

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}