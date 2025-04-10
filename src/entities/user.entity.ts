// src/entities/user.entity.ts
import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { NewsCategory } from './news-category.entity';
import { UserEmailMessage } from './user-email-message.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'boolean', default: false })
  is_bot: boolean;

  @Column({ type: 'varchar', length: 255 })
  first_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language_code: string;

  @Column({ type: 'boolean', default: false })
  can_join_groups: boolean;

  @Column({ type: 'boolean', default: false })
  can_read_all_group_messages: boolean;

  @Column({ type: 'boolean', default: false })
  supports_inline_queries: boolean;

  @Column({ type: 'varchar', length: 50, default: 'default' })
  state: string;

  @Column({ type: 'timestamp', nullable: true })
  last_active: Date;

  @ManyToMany(() => NewsCategory, { cascade: true })
  @JoinTable({
    name: 'user_news_category',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  newsCategories: NewsCategory[];

  @Column({ type: 'boolean', default: false })
  isNewsActive: boolean;

  @OneToMany(() => UserEmailMessage, (emailMessage) => emailMessage.user)
  emailMessages: UserEmailMessage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}