import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('attachment')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  thumbnail: string;

  @Column()
  original: string;

  @OneToOne(() => Category, (category) => category.image, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  categoryParent: Category;

  @OneToOne(() => Product, (product) => product.image, { nullable: true })
  @JoinColumn({ name: 'productId' })
  productImage: Category;

  @OneToOne(() => Product, (product) => product.gallery, { nullable: true })
  @JoinColumn({ name: 'productId' })
  productGallery: Product;
}
