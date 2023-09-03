// src/user/user.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BaseStatusResponse,
  ChangePasswordRequest,
  CreateAddressRequest,
  CreateContactRequest,
  CreateEmployeeRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UpdateUserStatusResponse,
} from './user.model';
import { Role, User } from 'src/libs/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { JwtService } from '@nestjs/jwt';
import { Address } from 'src/libs/entities/address.entity';
import { Contact } from 'src/libs/entities/contact.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { HttpStatusCode } from 'src/core/enum/HttpStatusCode';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly jwtService: JwtService,
    private readonly sendgridService: SendgridService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { role: Role.user } });
  }

  async findAllEmployee(): Promise<User[]> {
    return this.userRepository.find({ where: { role: Role.employee } });
  }

  async findOne(id: string): Promise<User> {
    //const user = await this.userRepository.findOne({ where: { id } });

    return this.userRepository.findOne({ where: { id } });
  }

  async findUserAddress(id: string): Promise<Address[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.addresses;
  }

  async createUserAddress(
    createAddressRequest: CreateAddressRequest,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    try {
      const userId = createAddressRequest.id;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['addresses'],
      });
      if (!user) {
        throw new Error('User not found');
      }

      const newAddress = new Address();
      newAddress.default = false;
      newAddress.formattedAddress = createAddressRequest.formatted_address;
      newAddress.title = createAddressRequest.title;

      await this.addressRepository.save(newAddress);
      user.addresses = [...user.addresses, newAddress];
      await this.userRepository.save(user);

      return new BaseResponse<BaseStatusResponse>({ isSuccess: true });
    } catch (error) {
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async createUserContact(
    createUserContact: CreateContactRequest,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    try {
      const userId = createUserContact.id;
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['contacts'],
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newContact = new Contact();
      newContact.default = false;
      newContact.number = createUserContact.number;
      newContact.title = createUserContact.title;

      await this.contactRepository.save(newContact);
      user.contacts = [...user.contacts, newContact];
      await this.userRepository.save(user);

      return new BaseResponse<BaseStatusResponse>({ isSuccess: true });
    } catch (error) {
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async findUserContact(id: string): Promise<Contact[]> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['contacts'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.contacts;
  }

  async update(
    updateUserRequest: UpdateUserRequest,
    id: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const { firstName, lastName, email, phoneNumber, address } =
      updateUserRequest;
    let isSuccess = false;

    const user = await this.tryFindUserById(id);

    if (user == null) {
      throw new NotFoundException('USER NOT FOUND!');
    }

    try {
      if (user.addresses.length == 0 && address != null && address != '') {
        const userDefaultDeliveryAddress = new Address();
        userDefaultDeliveryAddress.default = true;
        userDefaultDeliveryAddress.formattedAddress = address;
        userDefaultDeliveryAddress.title = 'Home';
        userDefaultDeliveryAddress.user = user; // Set the user association

        await this.addressRepository.save(userDefaultDeliveryAddress);

        user.addresses = [...user.addresses, userDefaultDeliveryAddress];
        await this.userRepository.save(user);
      }

      if (
        user.contacts.length == 0 &&
        phoneNumber != null &&
        phoneNumber != ''
      ) {
        const userDefaultContact = new Contact();
        userDefaultContact.default = true;
        userDefaultContact.number = phoneNumber;
        userDefaultContact.title = 'Default Contact';
        userDefaultContact.user = user;

        await this.contactRepository.save(userDefaultContact);

        user.contacts = [...user.contacts, userDefaultContact];
        await this.userRepository.save(user);
      }

      // Update user entity
      user.address = address;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phoneNumber;
      user.email = email;
      await this.userRepository.save(user);

      isSuccess = true;

      return new BaseResponse<BaseStatusResponse>({
        isSuccess,
      } as BaseStatusResponse);
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('ERRORS');
    }
  }

  async remove(userId: string): Promise<BaseStatusResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (user == null)
        throw new InternalServerErrorException('KHÔNG TÌM THẤY NGƯỜI DÙNG !');

      if (user.orders) {
        throw new InternalServerErrorException(
          'KHÔNG THỂ XÓA TÀI KHOẢN ĐANG CÓ ĐƠN HÀNG',
        );
      }

      await this.userRepository.remove(user);

      const responseModel = new BaseStatusResponse();
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async changePassword(
    changePasswordRequest: ChangePasswordRequest,
    id: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordRequest;

    const user = await this.tryFindUserById(id);

    if (user == null) throw new NotFoundException('USER NOT FOUND!');

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('UNAUTHORIZED !');
    }

    try {
      if (newPassword == confirmPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;

        await this.userRepository.save(user);

        const isSuccess = true;
        return new BaseResponse<BaseStatusResponse>({
          isSuccess,
        } as BaseStatusResponse);
      } else {
        throw new InternalServerErrorException(
          'PASSWORD AND NEW PASSWORD DOES NOT MATCH',
        );
      }
    } catch (error) {
      console.log('ERROR HERE', error);
      throw new InternalServerErrorException(
        'UPDATE PASSWORD FAILED ! SERVER ERROR',
      );
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('EMAIL NOT FOUND');
    }

    const randomPassword = this.generateRandomId(16);

    // Send Email
    try {
      const mailToSend = {
        to: email, // Change to your recipient
        from: 'hungryhub.food@gmail.com', // Change to your verified sender
        subject: '[HungryHub] New Password Information',
        html: `<p><strong>Ch&agrave;o</strong> ${user.username},&nbsp;</p>

        <p>Ch&uacute;ng t&ocirc;i đ&atilde; nhận được y&ecirc;u cầu đặt lại mật khẩu cho t&agrave;i khoản của bạn tr&ecirc;n nền tảng đặt m&oacute;n ăn trực tuyến của ch&uacute;ng t&ocirc;i. Dưới đ&acirc;y l&agrave; mật khẩu mới cho t&agrave;i khoản của bạn:&nbsp;</p>
        
        <p><strong>Mật khẩu mới:</strong> ${randomPassword}&nbsp;</p>
        
        <p>Vui l&ograve;ng đăng nhập bằng mật khẩu mới n&agrave;y v&agrave; sau đ&oacute; bạn c&oacute; thể thay đổi mật khẩu theo mong muốn từ phần c&agrave;i đặt t&agrave;i khoản. <strong>Ch&uacute;ng t&ocirc;i khuyến nghị bạn đổi mật khẩu ngay sau khi đăng nhập để đảm bảo an to&agrave;n cho t&agrave;i khoản của m&igrave;nh.&nbsp;</strong></p>
        
        <p>Xin cảm ơn v&agrave; ch&uacute;c bạn c&oacute; trải nghiệm tốt tr&ecirc;n nền tảng của ch&uacute;ng t&ocirc;i.&nbsp;</p>
        
        <p><strong>Tr&acirc;n trọng,&nbsp;</strong></p>
        
        <p><span style="font-size:8px"><img src="https://richtexteditor.com/imageuploads/638288136634148811-ca529b6e-529a-4ee8-a027-54552336d9e4.png" width="118px" height="27px" /></span></p>
        
        <p>&nbsp;</p>`,
      };
      await this.sendgridService.sendMail(mailToSend);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('SEND EMAIL FAIL, TRY AGAIN');
    }

    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    try {
      user.passwordHash = hashedPassword;
      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'CHANGE PASSWORD FAILED, TRY AGAIN',
      );
    }

    return new BaseResponse<BaseStatusResponse>({
      isSuccess: true,
    } as BaseStatusResponse);
  }

  generateRandomId(length) {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let randomId = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomId += charset[randomIndex];
    }

    return randomId;
  }

  async register(
    registerRequest: RegisterRequest,
  ): Promise<BaseResponse<LoginResponse>> {
    const { email, password, name } = registerRequest;

    console.log('PASSWORD WHEN REGISTER HERE: ', password);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.username = name;
    user.email = email;
    user.passwordHash = hashedPassword;
    user.role = Role.user;

    try {
      const newUser = await this.userRepository.save(user);

      if (newUser != null) {
        const role = newUser.role;
        const id = newUser.id;

        const token = this.jwtService.sign(
          { email, role, id },
          { subject: id },
        );

        return new BaseResponse<LoginResponse>({
          token,
          email,
          role,
        } as LoginResponse);
      } else {
        throw new NotFoundException('SAVE USER FAILED!');
      }
    } catch (error) {
      throw new UnauthorizedException('UNAUTHORIZED_EXCEPTION');
    }
  }

  async createEmployee(
    createEmployeeRequest: CreateEmployeeRequest,
  ): Promise<BaseResponse<BaseStatusResponse>> {
    const randomPassword = this.generateRandomId(8);

    // Hash the password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = new User();
    user.employeePassword = randomPassword;
    user.username =
      createEmployeeRequest.firstName + ' ' + createEmployeeRequest.lastName;
    user.firstName = createEmployeeRequest.firstName;
    user.lastName = createEmployeeRequest.lastName;
    user.address = createEmployeeRequest.address;
    user.email = createEmployeeRequest.email;
    user.dateOfBirth = createEmployeeRequest.dateOfBirth;
    user.dateHired = createEmployeeRequest.dateHired;
    user.nationalID = createEmployeeRequest.nationalID;
    user.phone = createEmployeeRequest.phone;
    user.position = createEmployeeRequest.position;
    user.passwordHash = hashedPassword;
    user.role = Role.employee;

    try {
      const newUser = await this.userRepository.save(user);

      if (newUser != null) {
        const responseModel = new BaseStatusResponse();
        responseModel.isSuccess = true;

        return new BaseResponse(responseModel, HttpStatusCode.SUCCESS);
      } else {
        throw new NotFoundException('SAVE USER FAILED!');
      }
    } catch (error) {
      throw new UnauthorizedException('UNAUTHORIZED_EXCEPTION');
    }
  }

  async updateEmployee(
    updateEmployeeRequest: UpdateEmployeeRequest,
  ): Promise<UpdateEmployeeResponse> {
    try {
      const employee = await this.userRepository.findOne({
        where: {
          id: updateEmployeeRequest.id,
        },
      });

      if (employee == null)
        throw new InternalServerErrorException('KHÔNG TÌM THẤY NHÂN VIÊN');

      employee.firstName = updateEmployeeRequest.firstName;
      employee.lastName = updateEmployeeRequest.lastName;
      employee.address = updateEmployeeRequest.address;
      employee.email = updateEmployeeRequest.email;
      employee.dateOfBirth = updateEmployeeRequest.dateOfBirth;
      employee.dateHired = updateEmployeeRequest.dateHired;
      employee.nationalID = updateEmployeeRequest.nationalID;
      employee.phone = updateEmployeeRequest.phone;
      employee.position = updateEmployeeRequest.position;

      const updatedEmployee = await this.userRepository.save(employee);

      if (updatedEmployee == null)
        throw new InternalServerErrorException(
          'GẶP LỖI TRONG QUÁ TRÌNH LƯU NHÂN VIÊN XUỐNG CSDL !',
        );

      const responseModel = new UpdateEmployeeResponse();
      responseModel.id = updatedEmployee.id;
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async updateUserStatus(
    updateUserStatus: UpdateUserStatusRequest,
  ): Promise<UpdateUserStatusResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: updateUserStatus.id,
        },
      });

      if (user == null)
        throw new InternalServerErrorException('KHÔNG TÌM THẤY NGƯỜI DÙNG !');

      user.status = updateUserStatus.status;

      const savedUser = await this.userRepository.save(user);

      if (savedUser == null)
        throw new InternalServerErrorException(
          'LƯU THÔNG TIN NGƯỜI DÙNG XUỐNG DATABASE THẤT BẠI !',
        );

      const responseModel = new UpdateUserStatusResponse();
      responseModel.id = savedUser.id;
      responseModel.isSuccess = true;

      return responseModel;
    } catch (error) {
      console.log('ERROR:', error);
      throw new InternalServerErrorException('SERVER ERROR EXCEPTION');
    }
  }

  async login(
    loginRequest: LoginRequest,
  ): Promise<BaseResponse<LoginResponse>> {
    try {
      const { id, email, role } = await this.tryLogin(loginRequest);
      const token = this.jwtService.sign({ email, role, id }, { subject: id });

      if (loginRequest.isPortal) {
        if (role === Role.admin || role === Role.employee) {
          return new BaseResponse<LoginResponse>({
            token,
            email,
            role,
          } as LoginResponse);
        } else {
          throw new UnauthorizedException('NO PERMISSION TO ACCESS PORTAL');
        }
      } else {
        return new BaseResponse<LoginResponse>({
          token,
          email,
          role,
        } as LoginResponse);
      }
    } catch (error) {
      console.log('ERROR HERE:', error);
      throw new UnauthorizedException('UNAUTHORIZED_EXCEPTION');
    }
  }

  /**
   * Perform login
   *
   * @param  {string} email     The username
   * @param  {string} password      The password
   * @return {Promise<User>}        The user info
   */
  private async tryLogin({ email, password }: LoginRequest): Promise<User> {
    // Get user with features loaded eagerly
    const user: User = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('UNAUTHORIZED !');
    }

    return user;
  }

  private async tryFindUserById(id: string): Promise<User> {
    // Get user with features loaded eagerly
    const user: User = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException('USER NOT FOUND');
    }

    return user;
  }

  /**
   * Get user by username
   *
   * @param  {string} email    The username
   * @return {Promise<User>}
   */
  private async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where({ email: email })
      .getOne();
  }

  private async getUserById(id: string): Promise<User> {
    return await this.userRepository
      .createQueryBuilder('user')
      .where({ id: id })
      .leftJoinAndSelect('user.addresses', 'addresses')
      .leftJoinAndSelect('user.contacts', 'contacts')
      .getOne();
  }
}
