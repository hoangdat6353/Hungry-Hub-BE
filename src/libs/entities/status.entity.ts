import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity()
export class Status extends BaseEntity {
  @Column()
  name: string;

  @Column()
  serial: number;

  @Column()
  color: string;

  @OneToMany(() => Order, (order) => order.status) // Establish the One-to-Many relationship
  orders: Order[];
}
