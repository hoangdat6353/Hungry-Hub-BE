import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from './base.entity';

@Entity('tags')
export class Tag extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];
}
