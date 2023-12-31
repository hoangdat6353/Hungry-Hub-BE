import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
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

  @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
