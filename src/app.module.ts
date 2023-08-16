import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import 'reflect-metadata';
import { UserModule } from './users/user.module';
import { ConfigModule } from './config/config.module';
import { CorsMiddleware } from './middlewares/cors.middleware';
import { RequestContextMiddleware } from './middlewares/request-context.middleware';
import { RequestContextModule } from './middlewares/request-context.module';
import { CategoryModule } from './categories/category.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    CategoryModule,
    ProductModule,
    ConfigModule,
    RequestContextModule.register({
      namespace: 'Hungry Hub',
      keyCurrentUser: 'user',
      keyTid: 'Hungry Hub',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
