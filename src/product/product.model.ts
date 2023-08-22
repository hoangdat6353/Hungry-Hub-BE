import { Role } from 'src/libs/entities/user.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Attachment } from 'src/libs/entities/attachment.entity';
import { Category } from 'src/libs/entities/category.entity';
import { Tag } from 'src/libs/entities/tag.entity';
import { Contact } from 'src/libs/entities/contact.entity';
import { Address } from 'src/libs/entities/address.entity';
import { GetAddressResponse, GetContactResponse } from 'src/users/user.model';

export class CreateOrderRequest {
  tracking_number: string;
  total: number;
  discount: number;
  customerId: string;
  shipping_fee: number;
  payment_gateway: string;
  shipping_address: GetAddressResponse;
  products: CreateOrderProductRequest[];
  contact: GetContactResponse;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  deliveryTips: number;
}

interface CreateOrderProductRequest {
  id: string;
  image: string;
  itemTotal: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  stock: number;
  unit: string;
}

export interface ResponseProductModel {
  id: string;
  name: string;
  slug: string;
  image: Attachment;
  //gallery: Attachment[];
  description: string;
  price: number;
  quantity: number;
  sold: number;
  salePrice: number;
  sku: string;
  category: Category;
  unit: string;
  tags: Tag[];
}

export class OrderItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
}
export class CreateOrderResponse {
  id: string | number;
  products: OrderItem[];
  total: number;
  tracking_number: string;
  customer: {
    id: string;
  };
  shipping_fee: number;
  payment_gateway: string;
  delivery_notes: string;
}
