import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    update: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    transformer: {
      from(value: Date): Date {
        return value;
      },
      to(value: Date): Date {
        return new Date();
      },
    },
  })
  updatedAt: Date;
}

export class AuditableEntity extends BaseEntity {
  @Column({ name: 'created_by', nullable: true, update: false })
  createdBy: string;

  @Column({ name: 'created_by_id', nullable: true, update: false })
  createdById: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById: string;

  @Column({ name: 'is_deleted', nullable: false, default: false })
  isDeleted: boolean;
}

export class BaseResponse<T> {
  data: T;
  statusCode?: number;
  message?: string;

  constructor(data: T, statusCode?: number, message?: string) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export class BasePaginationResponse<T> {
  data: T;
  statusCode?: number;
  paginationInfo: Pagination;
  total: number;
  totalPages: number;
  message?: string;

  constructor(
    data: T,
    paginationInfo: Pagination,
    total: number,
    totalPages: number,
    statusCode?: number,
    message?: string,
  ) {
    this.data = data;
    this.paginationInfo = paginationInfo;
    this.total = total;
    this.totalPages = totalPages;
    this.message = message;
    this.statusCode = statusCode;
  }
}

export class Pagination {
  nextPageUrl: string;
}
