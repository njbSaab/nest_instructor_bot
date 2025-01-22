import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { MenuButton } from './menu-button.entity';
  
  @Entity('menu_tables')
  export class MenuTable {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255 })
    name: string; // Название раздела
  
    @Column({ type: 'text', nullable: true })
    description: string; // Описание раздела
  
    @Column({ type: 'int', default: 0 })
    order: number; // Порядок отображения
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @OneToMany(() => MenuButton, (button) => button.menu)
    buttons: MenuButton[]; // Связь с кнопками
  }