import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: 'postgres://root:gyovS8eeXXHeHW4c3dzpJqTcCUCFtsY8@dpg-cje87s8cfp5c73bq3g8g-a.singapore-postgres.render.com/foodmanagement',
  // host: 'dpg-cje87s8cfp5c73bq3g8g-a.singapore-postgres.render.com',
  // port: 5432,
  // username: 'root',
  // password: 'gyovS8eeXXHeHW4c3dzpJqTcCUCFtsY8',
  // database: 'foodmanagement',
  entities: [__dirname + '/../libs/entities/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/../libs/migrations/**/*.ts'],
  subscribers: [__dirname + '/../libs/subcribers/**/*.ts'],
  ssl: true, // Enable SSL
};
