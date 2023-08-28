import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  BasePaginationResponse,
  BaseResponse,
} from 'src/libs/entities/base.entity';
import { HttpStatusCode } from 'src/core/enum/HttpStatusCode';
import { ProductService } from './product.service';
import {
  CreateOrderRequest,
  CreateOrderResponse,
  CreateProductRequest,
  CreateProductResponse,
  ResponseProductModel,
  UpdateProductRequest,
  UpdateProductResponse,
  UpdateProductStatusRequest,
} from './product.model';
import { Product } from 'src/libs/entities/product.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'multer';
import { BaseStatusResponse } from 'src/users/user.model';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('best-seller-products')
  async findAllBestSellerProducts(): Promise<BaseResponse<any[]>> {
    const products = await this.productService.findAllProductIsBestSeller();

    // Transform the categories into the desired response format
    const transformedProduct = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      //gallery: product.gallery,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      sold: product.sold,
      salePrice: product.salePrice,
      sku: product.sku,
      category: product?.category,
      unit: product.unit,
      tag: product.tags,
    }));

    return new BaseResponse(transformedProduct, HttpStatusCode.SUCCESS);
  }

  @Get('popular-products')
  async findAllPopularProducts(): Promise<BaseResponse<any[]>> {
    const products = await this.productService.findAllProductIsPopular();

    // Transform the order into the desired response format
    const transformedProduct: ResponseProductModel[] = products.map(
      (product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        //gallery: product.gallery,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        sold: product.sold,
        salePrice: product.salePrice,
        sku: product.sku,
        category: product?.category,
        unit: product.unit,
        tags: product.tags,
      }),
    );

    return new BaseResponse(transformedProduct, HttpStatusCode.SUCCESS);
  }

  @Get(':id/orders')
  async getAllOrdersFromUser(
    @Param('id') id: string,
  ): Promise<BaseResponse<any[]>> {
    const orders = await this.productService.findAllOrdersFromUserId(id);

    // Transform orders data and return the response
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      tracking_number: order.tracking_number,
      amount: order.total - order.discount,
      total: order.total,
      delivery_fee: order.shippingFee,
      discount: order.discount,
      status: order.status,
      delivery_time: order.deliveryTime,
      created_at: order.createdAt,
      products: order.products.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        image: product.image,
      })),
      shipping_address: {
        shipping_address: order.shippingAddress,
      },
    }));

    return new BaseResponse(transformedOrders, HttpStatusCode.SUCCESS);
  }

  @Get('orders')
  async getAllOrders(): Promise<BaseResponse<any[]>> {
    const orders = await this.productService.findAllOrders();

    // Transform orders data and return the response
    const transformedOrders = orders.map((order) => ({
      id: order.id,
      tracking_number: order.tracking_number,
      amount: order.total - order.discount,
      total: order.total,
      delivery_fee: order.shippingFee,
      discount: order.discount,
      status: order.status,
      delivery_time: order.deliveryTime,
      created_at: order.createdAt,
      products: order.products.map((product) => ({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        image: product.image,
      })),
      shipping_address: {
        shipping_address: order.shippingAddress,
      },
    }));

    return new BaseResponse(transformedOrders, HttpStatusCode.SUCCESS);
  }

  @Get('status')
  async getAllStatus(): Promise<BaseResponse<any[]>> {
    const status = await this.productService.findAllStatus();

    return new BaseResponse(status, HttpStatusCode.SUCCESS);
  }

  @Post('order')
  async createOrder(
    @Body() createOrderRequest: CreateOrderRequest,
  ): Promise<BaseResponse<CreateOrderResponse>> {
    const responseData = await this.productService.createOrder(
      createOrderRequest,
    );

    return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
  }

  @Post()
  async createProduct(
    @Body() createProductRequest: CreateProductRequest,
  ): Promise<BaseResponse<CreateProductResponse>> {
    const responseData = await this.productService.createProduct(
      createProductRequest,
    );

    return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
  }

  @Put()
  async updateProduct(
    @Body() updateProductRequest: UpdateProductRequest,
  ): Promise<BaseResponse<UpdateProductResponse>> {
    const responseData = await this.productService.updateProduct(
      updateProductRequest,
    );

    return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id') id: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const responseData = await this.productService.deleteProduct(id);

    return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
  }

  @Put('product-status')
  async updateProductStatus(
    @Body() updateProductRequest: UpdateProductStatusRequest,
  ): Promise<BaseResponse<UpdateProductResponse>> {
    const responseData = await this.productService.updateProductStatus(
      updateProductRequest,
    );

    return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const responseData = await this.productService.uploadProductImage(id, file);

    if (responseData.isSuccess)
      return new BaseResponse(responseData, HttpStatusCode.SUCCESS);
    else {
      return new BaseResponse(responseData, HttpStatusCode.FAILED);
    }
  }

  @Get(':id/related-products')
  async findAllRelatedProducts(
    @Param('id') id: string,
  ): Promise<BaseResponse<any[]>> {
    const products = await this.productService.findAllRelatedProducts(id);

    // Transform the products into the desired response format
    const transformedProduct: ResponseProductModel[] = products.map(
      (product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        //gallery: product.gallery,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        sold: product.sold,
        salePrice: product.salePrice,
        sku: product.sku,
        category: product?.category,
        unit: product.unit,
        tags: product.tags,
      }),
    );

    return new BaseResponse(transformedProduct, HttpStatusCode.SUCCESS);
  }

  @Get('find-by-id/:id')
  async getProductById(
    @Param('id') id: string,
  ): Promise<BaseResponse<ResponseProductModel>> {
    const product = await this.productService.findProductDetails(id);

    // Transform the products into the desired response format
    const transformedProduct: ResponseProductModel = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      sold: product.sold,
      salePrice: product.salePrice,
      sku: product.sku,
      category: product?.category,
      unit: product.unit,
      tags: product.tags,
      isBestSeller: product.isBestSeller,
      isPopular: product.isPopular,
    };

    return new BaseResponse(transformedProduct, HttpStatusCode.SUCCESS);
  }

  // @Get(':slug/details')
  // async findProductDetails(
  //   @Param('slug') slug: string,
  // ): Promise<BaseResponse<ResponseProductModel>> {
  //   const product = await this.productService.findProductDetails(slug);

  //   // Transform the products into the desired response format
  //   const transformedProduct: ResponseProductModel = {
  //     id: product.id,
  //     name: product.name,
  //     slug: product.slug,
  //     image: product.image,
  //     description: product.description,
  //     price: product.price,
  //     quantity: product.quantity,
  //     sold: product.sold,
  //     salePrice: product.salePrice,
  //     sku: product.sku,
  //     category: product?.category,
  //     unit: product.unit,
  //     tags: product.tags,
  //   };

  //   return new BaseResponse(transformedProduct, HttpStatusCode.SUCCESS);
  // }

  @Get('search')
  async searchProducts(
    @Query('query') query?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 30,
  ): Promise<BasePaginationResponse<ResponseProductModel[]>> {
    const { data, total, totalPages } =
      await this.productService.searchProducts(query, page, limit);

    // Transform the products into the desired response format
    const transformedProducts: ResponseProductModel[] = data.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      //gallery: product.gallery,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      sold: product.sold,
      salePrice: product.salePrice,
      sku: product.sku,
      category: product?.category,
      unit: product.unit,
      tags: product.tags,
      isBestSeller: product.isBestSeller,
      isPopular: product.isPopular,
    }));

    const nextPageUrl =
      page < totalPages
        ? `/products/search?query=${encodeURIComponent(query || '')}&page=${
            page + 1
          }&limit=${limit}`
        : null;

    const paginatorInfo = {
      nextPageUrl,
    };

    return new BasePaginationResponse(
      transformedProducts,
      paginatorInfo,
      total,
      totalPages,
      HttpStatusCode.SUCCESS,
    );
  }

  @Get('all')
  async getAllProducts(): Promise<BaseResponse<ResponseProductModel[]>> {
    const products = await this.productService.getAllProducts();

    const transformedProducts: ResponseProductModel[] = products.map(
      (product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        sold: product.sold,
        salePrice: product.salePrice,
        category: product?.category,
        unit: product.unit,
        tags: product.tags,
        isBestSeller: product.isBestSeller,
        isPopular: product.isPopular,
      }),
    );
    return new BaseResponse(transformedProducts, HttpStatusCode.SUCCESS);
  }
}
