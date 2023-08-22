import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
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
  @JoinColumn()
  productImage: Category;

  // @ManyToOne(() => Product, (product) => product.gallery, { nullable: true })
  // @JoinColumn()
  // productGallery: Product;
}
