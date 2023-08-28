import {
  Column,
  Entity,
  Index,
  OneToMany,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Contact } from './contact.entity';
import { Status } from './status.entity';

@Entity()
export class Order extends BaseEntity {
  @Index()
  @Column()
  tracking_number: string;

  @Column()
  customerId: string;

  @Column()
  total: number;

  @Column({ name: 'shipping_fee' })
  shippingFee: number;

  @Column({ default: 0 })
  discount: number;

  @Column({ name: 'payment_gateway', default: 'Payment on cash' })
  paymentGateway: string;

  @Column({ name: 'delivery_tips', default: 0 })
  deliveryTips: number;

  @Column({ name: 'delivery_time', nullable: true })
  deliveryTime: string;

  @Column({ name: 'delivery_date' })
  deliveryDate: string;

  @Column({ name: 'delivery_notes', nullable: true })
  deliveryNotes: string;

  @Column({ name: 'shipping_address' })
  shippingAddress: string;

  @ManyToMany(() => Product, (product) => product.orders)
  products: Product[];

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => Contact, (contact) => contact.order)
  @JoinColumn()
  contacts: Contact[];

  @ManyToOne(() => Status, (status) => status.orders) // Define the relationship with Status entity
  @JoinColumn({ name: 'status_id' }) // Column name in the Order table to store the status ID
  status: Status;
}
