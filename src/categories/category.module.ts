import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/libs/entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), CloudinaryModule, SendgridModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
