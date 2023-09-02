// src/user/user.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from 'src/libs/entities/category.entity';
import {
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
} from './category.model';
import { Express } from 'multer';
import { BaseStatusResponse } from 'src/users/user.model';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Attachment } from 'src/libs/entities/attachment.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['children', 'image', 'parent', 'products'],
    });

    return categories;
  }

  async createCategory(
    createCategoryRequest: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    try {
      const newCategory = new Category();
      newCategory.name = createCategoryRequest.name;
      newCategory.slug = createCategoryRequest.slug;

      const category = await this.categoryRepository.save(newCategory);

      const responseModel = new CreateCategoryResponse();
      responseModel.id = category.id;
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async uploadCategoryImage(
    categoryId: string,
    file: Express.Multer.File,
  ): Promise<BaseStatusResponse> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });

    if (category == null)
      throw new InternalServerErrorException('CATEGORY NOT FOUND !');

    const uploadImageData = await this.cloudinaryService.uploadFile(file);

    const attachment = new Attachment();
    attachment.categoryImage = category;
    attachment.original = uploadImageData.url;
    attachment.thumbnail = uploadImageData.url;
    attachment.productImage = null;

    category.icon = uploadImageData.url;

    const savedAttachment = await this.attachmentRepository.save(attachment);
    const response = new BaseStatusResponse();

    if (savedAttachment) {
      response.isSuccess = true;
    } else {
      response.isSuccess = false;
    }

    return response;
  }

  async deleteCategory(categoryId: string): Promise<BaseStatusResponse> {
    try {
      const category = await this.categoryRepository.findOne({
        where: {
          id: categoryId,
        },
      });

      if (category == null)
        throw new InternalServerErrorException('KHÔNG TÌM THẤY DANH MỤC !');

      if (category.products) {
        throw new InternalServerErrorException(
          'KHÔNG THỂ XÓA DANH MỤC VẪN CÓ MÓN ĂN',
        );
      }

      await this.categoryRepository.remove(category);

      const responseModel = new BaseStatusResponse();
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async findCategoryDetails(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
      relations: ['children', 'image', 'parent', 'products'],
    });

    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }

    return category;
  }

  async updateCategory(
    updateCategoryRequest: UpdateCategoryRequest,
  ): Promise<UpdateCategoryResponse> {
    try {
      const category = await this.categoryRepository.findOne({
        where: {
          id: updateCategoryRequest.id,
        },
      });

      if (category == null)
        throw new InternalServerErrorException('KHÔNG TÌM THẤY DANH MỤC');

      category.name = updateCategoryRequest.name;
      category.slug = updateCategoryRequest.slug;

      const savedCategory = await this.categoryRepository.save(category);

      if (savedCategory == null)
        throw new InternalServerErrorException(
          'GẶP LỖI TRONG QUÁ TRÌNH LƯU DANH MỤC XUỐNG CSDL !',
        );

      const responseModel = new UpdateCategoryResponse();
      responseModel.id = savedCategory.id;
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }
}
