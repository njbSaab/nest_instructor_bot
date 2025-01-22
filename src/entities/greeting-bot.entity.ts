import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('greeting_bot')
export class GreetingBot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  greeting_text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}