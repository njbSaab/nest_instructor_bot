import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NewsCategory } from './news-category.entity'; // убедитесь, что путь правильный

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

  @Column({ type: 'text', nullable: true })
  post_image_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  btn_title: string;

  /**
   * Вместо enum мы создаём связь с таблицей категорий.
   */
  @ManyToOne(() => NewsCategory, { eager: true }) // eager: true для автоматической загрузки категории
  @JoinColumn({ name: 'categoryId' })
  category: NewsCategory;

  /**
   * Поле доступности (по умолчанию false).
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