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
