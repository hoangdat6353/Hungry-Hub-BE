import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { User } from 'src/libs/entities/user.entity';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { CategoryService } from './category.service';
import { Category } from 'src/libs/entities/category.entity';
import { HttpStatusCode } from 'src/core/enum/HttpStatusCode';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Express } from 'multer';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(): Promise<BaseResponse<any[]>> {
    const categories = await this.categoryService.findAll();

    // Transform the categories into the desired response format
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      icon: category.icon,
      children: category.children,
    }));

    return new BaseResponse(transformedCategories, HttpStatusCode.SUCCESS);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'image' is the name of the field in the form-data
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    return uploadResult;
  }
}
