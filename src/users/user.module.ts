import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/libs/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Contact } from 'src/libs/entities/contact.entity';
import { Address } from 'src/libs/entities/address.entity';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, Address]),
    JwtModule.register({
      secret: 'secret',
      signOptions: {
        expiresIn: '18000',
      },
    }),
    SendgridModule
  ],
  controllers: [UserController],
  providers: [UsersService],
})
export class UserModule {}
