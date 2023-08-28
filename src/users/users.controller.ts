import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  BaseStatusResponse,
  ChangePasswordRequest,
  CreateAddressRequest,
  CreateContactRequest,
  GetAddressResponse,
  GetContactResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
} from './user.model';
import { User } from 'src/libs/entities/user.entity';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { Address } from 'src/libs/entities/address.entity';
import { HttpStatusCode } from 'src/core/enum/HttpStatusCode';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(): Promise<BaseResponse<User[]>> {
    const users = await this.userService.findAll();

    return new BaseResponse(users, HttpStatusCode.SUCCESS);
  }

  @Get('employee')
  async findAllEmployee(): Promise<BaseResponse<User[]>> {
    const employee = await this.userService.findAllEmployee();

    return new BaseResponse(employee, HttpStatusCode.SUCCESS);
  }

  //Find user by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  //Get user address by ID
  @Get(':id/address')
  async findUserAddresses(
    @Param('id') id: string,
  ): Promise<BaseResponse<GetAddressResponse[]>> {
    const userAddresses = await this.userService.findUserAddress(id);
    const addressResponseModel: GetAddressResponse[] = userAddresses.map(
      (address) => ({
        id: address.id,
        title: address.title,
        default: address.default,
        address: {
          formatted_address: address.formattedAddress,
        },
      }),
    );

    return new BaseResponse(addressResponseModel, HttpStatusCode.SUCCESS);
  }

  @Post('/address')
  public async createAddress(
    @Body() CreateAddressRequest: CreateAddressRequest,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    return await this.userService.createUserAddress(CreateAddressRequest);
  }

  //Get user contact by ID
  @Get(':id/contact')
  async findUserContact(
    @Param('id') id: string,
  ): Promise<BaseResponse<GetContactResponse[]>> {
    const userContact = await this.userService.findUserContact(id);
    const contactResponseModel: GetContactResponse[] = userContact.map(
      (contact) => ({
        id: contact.id,
        title: contact.title,
        default: contact.default,
        number: contact.number,
      }),
    );

    return new BaseResponse(contactResponseModel, HttpStatusCode.SUCCESS);
  }

  @Post('/contact')
  public async createContact(
    @Body() createContactRequest: CreateContactRequest,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    return await this.userService.createUserContact(createContactRequest);
  }

  @Post('register')
  async register(
    @Body() createUserDto: RegisterRequest,
  ): Promise<BaseResponse<LoginResponse>> {
    return this.userService.register(createUserDto);
  }

  @Put(':id')
  async update(
    @Body() updateUserRequest: UpdateUserRequest,
    @Param('id') id: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    return this.userService.update(updateUserRequest, id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }

  @Post('login')
  public async login(
    @Body() loginRequest: LoginRequest,
  ): Promise<BaseResponse<LoginResponse>> {
    return await this.userService.login(loginRequest);
  }

  @Post('change-password/:id')
  public async changePassword(
    @Body() ChangePasswordRequest: ChangePasswordRequest,
    @Param('id') id: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    return await this.userService.changePassword(ChangePasswordRequest, id);
  }

  @Post('forgot-password')
  public async forgotPassword(
    @Body('email') email: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    return await this.userService.forgotPassword(email);
  }
}
