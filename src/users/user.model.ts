import { Role } from 'src/libs/entities/user.entity';
import {
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
}

export class UpdateUserRequest {
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
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
