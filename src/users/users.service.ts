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
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
} from './user.model';
import { Role, User } from 'src/libs/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BaseResponse } from 'src/libs/entities/base.entity';
import { JwtService } from '@nestjs/jwt';
import { Address } from 'src/libs/entities/address.entity';
import { Contact } from 'src/libs/entities/contact.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';

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
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    //const user = await this.userRepository.findOne({ where: { id } });

    console.log(
      'USER HERE',
      await this.userRepository.findOne({ where: { id } }),
    );
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
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      address,
    } = updateUserRequest;
    let isSuccess = false;

    if (confirmPassword !== password) {
      throw new NotFoundException('PASSWORD NOT MATCH!');
    }

    const user = await this.tryFindUserById(id);

    if (user == null) {
      throw new NotFoundException('USER NOT FOUND!');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      if (user.addresses.length == 0 && address != null && address != '') {
        const userDefaultDeliveryAddress = new Address();
        userDefaultDeliveryAddress.default = true;
        userDefaultDeliveryAddress.formattedAddress = address;
        userDefaultDeliveryAddress.title = 'Home';
        userDefaultDeliveryAddress.user = user; // Set the user association

        await this.addressRepository.save(userDefaultDeliveryAddress);

        user.addresses = [...user.addresses, userDefaultDeliveryAddress];
        await this.userRepository.save(user);
        console.log('REACHED ADDRESS');
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
        console.log('REACHED CONTACT');
      }

      console.log('DONT GO INTO CONTACT');
      // Update user entity
      user.address = address;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phoneNumber;
      user.email = email;
      user.passwordHash = hashedPassword;

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

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
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

        await this.userRepository.update(user.id, user);

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
        from: 'nguyentrungthoi7601@gmail.com', // Change to your verified sender
        subject: 'New Password for Hungry',
        html: `<strong>Here is your new password, remember to change it: <b>${randomPassword}</b></strong>`,
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

  async login(
    loginRequest: LoginRequest,
  ): Promise<BaseResponse<LoginResponse>> {
    try {
      const { id, email, role } = await this.tryLogin(loginRequest);
      const token = this.jwtService.sign({ email, role, id }, { subject: id });

      return new BaseResponse<LoginResponse>({
        token,
        email,
        role,
      } as LoginResponse);
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

    console.log('EMAIL WHEN LOGIN HERE:', email);
    console.log('PASSWORD WHEN LOGIN HERE:', password);

    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('IS VALID HERE:', isValid);

    if (!isValid) {
      throw new UnauthorizedException('UNAUTHORIZED !');
    }

    return user;
  }

  private async tryFindUserById(id: string): Promise<User> {
    // Get user with features loaded eagerly
    console.log('USER ID HERE:' + id);
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
