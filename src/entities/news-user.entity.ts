import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  
  /**
   * Таблица news_bot — хранит новости для различных категорий (футбол, баскетбол и т.д.).
   */
  @Entity('news_bot')
  export class NewsUser {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    post_title: string;
  
    @Column({ type: 'text', nullable: true })
    post_content: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    post_image_url: string;
  
    /**
     * Категория новости (football, basketball, box, ufc).
     * Можно хранить как enum или просто строку (enum в TypeORM).
     */
    @Column({
      type: 'enum',
      enum: ['football', 'basketball', 'box', 'ufc'],
      nullable: false,
    })
    category: 'football' | 'basketball' | 'box' | 'ufc';
  
    /**
     * Поле доступности (по умолчанию false).
     * Например, можно интерпретировать как "отправлять ли новость".
     */
    @Column({ type: 'boolean', default: false })
    isActive: boolean;
  
    /**
     * Ссылка на ресурс, где подробнее про новость
     */
    @Column({ type: 'varchar', length: 255, nullable: true })
    news_url: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }