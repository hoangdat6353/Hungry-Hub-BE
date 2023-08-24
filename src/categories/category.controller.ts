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
  Query,
} from '@nestjs/common';
import { User } from 'src/libs/entities/user.entity';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { CategoryService } from './category.service';
import { Category } from 'src/libs/entities/category.entity';
import { HttpStatusCode } from 'src/core/enum/HttpStatusCode';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Express } from 'multer';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly sendgridService: SendgridService,
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
      numberOfProducts: category.products.length,
    }));

    return new BaseResponse(transformedCategories, HttpStatusCode.SUCCESS);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'image' is the name of the field in the form-data
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    return uploadResult;
  }

  @Post('send-email')
  async sendEmail(@Body('email') email: string) {
    console.log(email);

    const mail = {
      to: email, // Change to your recipient
      from: 'nguyentrungthoi7601@gmail.com', // Change to your verified sender
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };

    return await this.sendgridService.sendMail(mail);
  }
}
