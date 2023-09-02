import { Category } from 'src/libs/entities/category.entity';

export class GetAllCategoriesResponseModel {
  id: string;
  name: string;
  slug: string;
  image: CategoryImage;
  icon?: string;
  children: CategoryChildren[];
}

class CategoryImage {
  id: string;
  thumbnail: string;
  original: string;
}

class CategoryChildren {
  id: string;
  name: string;
  slug: string;
}

export class CreateCategoryRequest {
  name: string;
  slug: string;
}

export class CreateCategoryResponse {
  id: string;
  isSuccess: boolean;
}

export class UpdateCategoryRequest {
  id: string;
  name: string;
  slug: string;
}

export class UpdateCategoryResponse {
  id: string;
  isSuccess: boolean;
}
