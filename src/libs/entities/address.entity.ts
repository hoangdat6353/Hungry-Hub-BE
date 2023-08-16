import {
  Column,
  Entity,
  Index,
  Unique,
  OneToMany,
  ManyToOne,
  OneToOne,
  Double,
  JoinColumn,
} from 'typeorm';
import { AuditableEntity, BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Address extends BaseEntity {
  @Index()
  @Column()
  title: string;

  @Column({ default: true })
  default: boolean;

  @Column({ name: 'formartted_address' })
  formattedAddress: string;

  @ManyToOne(() => User, (user) => user.contacts)
  @JoinColumn({ name: 'userId' }) // Specify the foreign key column
  user: User;
}
