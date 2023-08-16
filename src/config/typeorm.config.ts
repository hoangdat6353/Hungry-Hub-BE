import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  database: 'foodmanagement',
  entities: [__dirname + '/../libs/entities/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/../libs/migrations/**/*.ts'],
  subscribers: [__dirname + '/../libs/subcribers/**/*.ts'],
};
