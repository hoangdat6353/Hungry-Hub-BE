import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  // host: 'localhost',
  // port: 5432,
  // username: 'root',
  // password: 'root',
  // database: 'foodmanagement',
  entities: [__dirname + '/../libs/entities/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: [__dirname + '/../libs/migrations/**/*.ts'],
  subscribers: [__dirname + '/../libs/subcribers/**/*.ts'],
  url: 'postgres://root:lbcVRiVlEDn04dS2IrujppfZzCKJOsh9@dpg-cjea5irbq8nc73cmvf40-a.oregon-postgres.render.com/hungryhub',
  ssl: true, // Enable SSL
};
