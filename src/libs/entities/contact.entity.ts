import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity()
export class Contact extends BaseEntity {
  @Index()
  @Column()
  title: string;

  @Column({ default: true })
  default: boolean;

  @Column()
  number: string;

  @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Order, (order) => order.contacts, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;
}
