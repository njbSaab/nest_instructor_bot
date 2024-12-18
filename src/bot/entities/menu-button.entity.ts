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

  @Column({ type: 'int', nullable: true })
  row_order: number | null; // Порядок строки кнопки

  @Column({ type: 'int', nullable: true })
  column_order: number | null; // Порядок столбца кнопки

  @Column({ type: 'boolean', default: false })
  is_inline: boolean; // Является ли кнопка инлайн-кнопкой

  @Column({ type: 'varchar', length: 255, nullable: true })
  group_key: string | null; // Группа кнопок (для инлайн-кнопок)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}