import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from './user.entity';
  
  /**
   * Таблица users_sport (одна строка на каждого пользователя).
   * 
   * Здесь храним флаги подписок:
   *  - football
   *  - basketball
   *  - box (бокс)
   *  - ufc
   */
  @Entity('users_sport')
  export class UserSports {
    @PrimaryGeneratedColumn()
    id: number; // уникальный PK этой таблицы
  
    // Связь "один к одному" с таблицей `users`
    // Каждый UserSports связан с конкретным User
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' }) // столбец userId в таблице users_sport
    user: User;
  
    @Column({ type: 'boolean', default: false })
    football: boolean;
  
    @Column({ type: 'boolean', default: false })
    basketball: boolean;
  
    @Column({ type: 'boolean', default: false })
    box: boolean;
  
    @Column({ type: 'boolean', default: false })
    ufc: boolean;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }