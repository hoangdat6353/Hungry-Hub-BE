import {
  Column,
  Entity,
  Index,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Order } from './order.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  sold: number;

  @Column()
  unit: string;

  @Column({ name: 'sale_price', nullable: true })
  salePrice: number;

  @Column({ name: 'min_price', nullable: true })
  minPrice: number;

  @Column({ name: 'max_price', nullable: true })
  maxPrice: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'is_best_seller', default: false })
  isBestSeller: boolean;

  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @OneToOne(() => Attachment, (image) => image.productImage, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  image: Attachment;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.products, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'products_tags' })
  tags: Tag[];

  @ManyToMany(() => Order, (order) => order.products, { onDelete: 'CASCADE' })
  @JoinTable({ name: 'products_orders' })
  orders: Order[];
}
