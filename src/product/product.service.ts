// src/user/user.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Not, Repository } from 'typeorm';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { Product } from 'src/libs/entities/product.entity';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderItem,
} from './product.model';
import { User } from 'src/libs/entities/user.entity';
import { Order } from 'src/libs/entities/order.entity';
import { Status } from 'src/libs/entities/status.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
  ) {}

  async findAllProductIsBestSeller(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: {
        isBestSeller: true,
      },
      relations: ['image', 'category', 'tags'],
    });

    return products;
  }

  async findAllProductIsPopular(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: {
        isPopular: true,
      },
      relations: ['image', 'category', 'tags'],
    });

    return products;
  }

  async createOrder(
    createOrderRequest: CreateOrderRequest,
  ): Promise<CreateOrderResponse> {
    try {
      const userId = createOrderRequest.customerId;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['addresses', 'contacts'],
      });
      if (!user) {
        throw new Error('User not found');
      }

      const contact = user.contacts.find(
        (c) => c.id === createOrderRequest.contact.id,
      );

      const orderStatus: Status = await this.statusRepository.findOne({
        where: { id: '3f3dc886-bc8a-4e49-b987-28f76cb92124' },
      });

      const productIds = createOrderRequest.products.map(
        (product) => product.id,
      );

      // Find all products with matching IDs
      const matchingProducts = await this.productRepository.find({
        where: { id: In(productIds) },
      });

      const newOrder = new Order();
      newOrder.customerId = user.id;
      newOrder.total = createOrderRequest.total;
      newOrder.shippingFee = createOrderRequest.shipping_fee;
      newOrder.shippingAddress =
        createOrderRequest.shipping_address.address.formatted_address;
      newOrder.deliveryTime = createOrderRequest.deliveryTime.replace(
        /^"(.*)"$/,
        '$1',
      );
      newOrder.deliveryDate = createOrderRequest.deliveryDate.replace(
        /^"(.*)"$/,
        '$1',
      );
      newOrder.paymentGateway = createOrderRequest.payment_gateway;
      newOrder.discount = createOrderRequest.discount;
      newOrder.tracking_number = createOrderRequest.tracking_number;
      newOrder.deliveryTips = createOrderRequest.deliveryTips;

      newOrder.user = user;
      newOrder.contacts = [contact];
      newOrder.products = matchingProducts;
      newOrder.status = orderStatus;

      const newSavedOrder = await this.orderRepository.save(newOrder);

      const orderItems: OrderItem[] = createOrderRequest.products.map(
        (product) => {
          const orderItem: OrderItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
          };
          return orderItem;
        },
      );

      const responseModel = new CreateOrderResponse();
      responseModel.customer = { id: newSavedOrder.customerId }; // Initialize the customer object
      responseModel.tracking_number = newSavedOrder.tracking_number;
      responseModel.total = newSavedOrder.total;
      responseModel.shipping_fee = newSavedOrder.shippingFee;
      responseModel.payment_gateway = newSavedOrder.paymentGateway;
      responseModel.products = orderItems;
      responseModel.id = newSavedOrder.id;
      responseModel.delivery_notes = createOrderRequest.deliveryNotes;

      return responseModel;
    } catch (error) {
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async findAllOrdersFromUserId(userId: string): Promise<Order[]> {
    // Find all orders that belong to the user matching userId
    const orders = await this.orderRepository.find({
      where: { user: { id: userId } }, // Filter by userId column
      relations: ['status', 'products', 'products.image'],
    });

    return orders;
  }

  async findAllStatus(): Promise<Status[]> {
    const status = await this.statusRepository.find({
      order: { serial: 'ASC' },
    });
    return status;
  }

  async findAllRelatedProducts(productId: string): Promise<Product[]> {
    let product: Product | undefined;

    if (isUUID(productId)) {
      // If the input is a valid UUID, look up by ID
      product = await this.productRepository.findOne({
        where: {
          id: productId,
        },
        relations: ['tags'],
      });
    } else {
      // If the input is not a valid UUID, look up by slug
      product = await this.productRepository.findOne({
        where: {
          slug: productId,
        },
        relations: ['tags'],
      });
    }

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const tagIds = product.tags.map((tag) => tag.id);

    const relatedProductIds = await this.productRepository
      .createQueryBuilder('product')
      .select('product.id')
      .leftJoin('product.tags', 'tag')
      .whereInIds(tagIds)
      .andWhere('product.id != :productId', { productId: product.id })
      .getMany();

    const relatedProducts = await this.productRepository.find({
      where: {
        id: In(relatedProductIds.map((p) => p.id)), // Use the retrieved IDs
      },
      relations: ['tags'],
    });

    return relatedProducts;
  }

  async findProductDetails(productSlug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        slug: productSlug,
      },
      relations: ['image', 'category', 'tags'],
    });

    if (!product) {
      throw new Error(`Product with slug ${productSlug} not found`);
    }

    return product;
  }

  async searchProducts(
    query?: string,
    page = 1,
    limit = 30,
  ): Promise<{
    data: Product[];
    paginatorInfo: {
      nextPageUrl: string | null;
    };
    total: number;
    totalPages: number;
  }> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    queryBuilder
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.image', 'image');
    if (query) {
      const keywords = query.split(',');
      const categoryConditions = keywords.map((keyword) => {
        return `category.name ILIKE '%${keyword}%' OR category.slug ILIKE '%${keyword}%'`;
      });
      const productNameCondition = `product.name ILIKE '%${query}%'`;
      const categoryWhereClause = categoryConditions.join(' OR ');
      const whereClause = `(${categoryWhereClause}) OR ${productNameCondition}`;

      queryBuilder.where(whereClause);
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    const nextPageUrl =
      page < totalPages
        ? `/products/search?query=${encodeURIComponent(query || '')}&page=${
            page + 1
          }&limit=${limit}`
        : null;

    const paginatorInfo = {
      nextPageUrl,
    };

    return { data, paginatorInfo, total, totalPages };
  }
}
