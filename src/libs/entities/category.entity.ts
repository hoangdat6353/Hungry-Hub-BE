import {
  Column,
  Entity,
  Index,
  Unique,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { AuditableEntity, BaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';
import { Product } from './product.entity';

@Entity()
export class Category extends BaseEntity {
  @Index()
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  icon: string;

  @OneToOne(() => Attachment, (image) => image.categoryParent, {
    nullable: true,
  })
  image: Attachment;

  @OneToMany(() => Category, (category) => category.parent, { nullable: true })
  children: Category[];

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  parent: Category;

  @OneToMany(() => Product, (product) => product.category, { nullable: true })
  products: Product[];
}
