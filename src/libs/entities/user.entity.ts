import { Column, Entity, Index, Unique, OneToMany } from 'typeorm';
import { AuditableEntity } from './base.entity';
import { Exclude } from 'class-transformer';
import { Address } from './address.entity';
import { Contact } from './contact.entity';
import { Order } from './order.entity';

export enum Role {
  admin = 'admin',
  employee = 'employee',
  user = 'user',
}

export enum Position {
  CASHIER = 'THU NGÂN',
  KITCHEN = 'BẾP',
  BARTENDER = 'PHA CHẾ',
  DELIVERY = 'GIAO HÀNG',
}

export const ADMINISTRATOR_ROLES = [Role.admin, Role.employee];

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

  @Column({ name: 'date_hired', nullable: true })
  dateHired: string;

  @Column({ name: 'national_id', nullable: true })
  nationalID: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: true })
  status: boolean;

  @Column({ name: 'employee_password', nullable: true })
  employeePassword: string;

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
    onDelete: 'CASCADE',
  })
  addresses: Address[];

  @OneToMany(() => Contact, (contact) => contact.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  contacts: Contact[];

  @OneToMany(() => Order, (order) => order.user, { onDelete: 'CASCADE' })
  orders: Order[];
}
