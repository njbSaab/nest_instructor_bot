import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('menu_buttons')
export class MenuButton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Название кнопки

  @Column({ type: 'varchar', length: 255, unique: true })
  action: string; // Уникальное действие

  @Column({ type: 'int', nullable: true })
  parent_id: number | null; // Родительская кнопка, если есть

  @Column({ type: 'text', nullable: true })
  content: string | null; // Контент кнопки

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}