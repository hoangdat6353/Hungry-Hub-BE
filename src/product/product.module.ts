import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/libs/entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { User } from 'src/libs/entities/user.entity';
import { Order } from 'src/libs/entities/order.entity';
import { Status } from 'src/libs/entities/status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Order, Status])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
