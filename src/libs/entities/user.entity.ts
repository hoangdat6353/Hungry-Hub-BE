import { Column, Entity, Index, Unique, OneToMany } from 'typeorm';
import { AuditableEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { Address } from './address.entity';
import { Contact } from './contact.entity';
import { Order } from './order.entity';

export enum Role {
  sysadmin = 'sysadmin',
  admin = 'admin',
  user = 'user',
}

export const ADMINISTRATOR_ROLES = [Role.sysadmin, Role.admin];

@Entity()
@Unique(['username'])
@Unique(['email'])
export class User extends AuditableEntity {
  @Index()
  @Column()
  username: string;

  @Column()
  role: Role;

  @Column()
  email: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'date_of_birth', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 'Active' })
  status: string;

  @Exclude()
  @Column({ name: 'reset_password_token', nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamptz' })
  lastLoggedInAt: Date;

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Exclude()
  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @OneToMany(() => Address, (address) => address.user, {
    nullable: true,
  })
  addresses: Address[];

  @OneToMany(() => Contact, (contact) => contact.user, {
    nullable: true,
  })
  contacts: Contact[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
