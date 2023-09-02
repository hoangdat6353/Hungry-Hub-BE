import { Role } from 'src/libs/entities/user.entity';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateHired: string;
  nationalID: string;
  position: string;
  phone: string;
  address: string;
  email: string;
}

export interface UpdateEmployeeRequest {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  dateHired: string;
  nationalID: string;
  position: string;
  phone: string;
  address: string;
  email: string;
}

export class UpdateEmployeeResponse {
  id: string;
  isSuccess: boolean;
}

export interface UpdateUserStatusRequest {
  id: string;
  status: boolean;
}

export class UpdateUserStatusResponse {
  id: string;
  isSuccess: boolean;
}

export class TokensResponse {
  token: string;
}

export class LoginResponse extends TokensResponse {
  email: string;
  role: Role;
}

export class LoginRequest {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  isPortal?: boolean;
}

export class UpdateUserRequest {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export class BaseStatusResponse {
  isSuccess: boolean;
}

export class ChangePasswordRequest {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;

  @IsString()
  confirmPassword: string;
}

export class CreateAddressRequest {
  id: string;
  default: boolean;
  title: string;
  formatted_address: string;
}

export class CreateContactRequest {
  id: string;
  default: boolean;
  title: string;
  number: string;
}

export class GetAddressResponse {
  id: string;
  title: string;
  default: boolean;
  address: IAddress;
}

export class IAddress {
  formatted_address: string;
}

export class GetContactResponse {
  id: string;
  title: string;
  default: boolean;
  number: string;
}
