import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { MenuTable } from './menu-tables.entity';
  
  @Entity('menu_buttons')
  export class MenuButton {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => MenuTable, (menu) => menu.buttons, { onDelete: 'CASCADE' })
    menu: MenuTable; // Ссылка на раздел меню
  
    @Column({ type: 'varchar', length: 255 })
    name: string; // Название кнопки
  
    @Column({ type: 'enum', enum: ['keyboard', 'inline'] })
    type: 'keyboard' | 'inline'; // Тип кнопки
  
    @Column({ type: 'text', nullable: true })
    content: string; // Основной текст кнопки
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    url: string; // Ссылка для инлайн-кнопок
  
    @Column({ type: 'int', nullable: true })
    parent_id: number; // Ссылка на родительскую кнопку
  
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