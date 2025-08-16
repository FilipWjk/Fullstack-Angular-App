// * Card entity (TypeORM)
// ! Purpose: Maps the `cards` table to a TypeScript class used by the app.
// ? Note: created/updated timestamps map to DB columns `created_at`/`updated_at` via decorators.
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column('float')
  rating: number;

  @Column()
  description: string;

  @Column()
  author: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
