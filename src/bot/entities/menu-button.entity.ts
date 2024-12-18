import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('menu_buttons')
export class MenuButton {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  action: string;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => MenuButton, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuButton;
}