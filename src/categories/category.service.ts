// src/user/user.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from 'src/libs/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { JwtService } from '@nestjs/jwt';
import { Category } from 'src/libs/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      relations: ['children', 'image', 'parent'],
    });

    return categories;
  }
}
