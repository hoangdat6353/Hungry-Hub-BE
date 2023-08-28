import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/libs/entities/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { User } from 'src/libs/entities/user.entity';
import { Order } from 'src/libs/entities/order.entity';
import { Status } from 'src/libs/entities/status.entity';
import { Category } from 'src/libs/entities/category.entity';
import { Attachment } from 'src/libs/entities/attachment.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Tag } from 'src/libs/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      User,
      Order,
      Status,
      Category,
      Attachment,
      Tag,
    ]),
    CloudinaryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
