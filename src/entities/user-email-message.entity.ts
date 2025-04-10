// src/entities/user-email-message.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_email_messages')
export class UserEmailMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.emailMessages, { nullable: true })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string; // Заменяем positivity на subject

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: 'pending' | 'sent' | 'failed';

  @Column({ type: 'boolean', default: false })
  isSent: boolean;

  @CreateDateColumn()
  sentAt: Date;
}