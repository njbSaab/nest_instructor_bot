import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('users')
  export class User {
    @PrimaryColumn({ type: 'bigint' })
    id: number; // ID пользователя Telegram
  
    @Column({ type: 'boolean', default: false })
    is_bot: boolean; // Является ли ботом
  
    @Column({ type: 'varchar', length: 255 })
    first_name: string; // Имя пользователя
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    last_name: string; // Фамилия пользователя
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    username: string; // Никнейм пользователя
  
    @Column({ type: 'varchar', length: 10, nullable: true })
    language_code: string; // Код языка
  
    @Column({ type: 'boolean', default: false })
    can_join_groups: boolean; // Может ли присоединяться к группам
  
    @Column({ type: 'boolean', default: false })
    can_read_all_group_messages: boolean; // Может ли читать все сообщения
  
    @Column({ type: 'boolean', default: false })
    supports_inline_queries: boolean; // Поддерживает ли инлайн-запросы
  
    @Column({ type: 'varchar', length: 50, default: 'default' })
    state: string; // Текущее состояние
  
    @Column({ type: 'timestamp', nullable: true })
    last_active: Date; // Последняя активность
  
    @CreateDateColumn()
    created_at: Date; // Дата создания записи
  
    @UpdateDateColumn()
    updated_at: Date; // Дата обновления записи
  }