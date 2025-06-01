import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  InvalidUUIDException,
  UserNotFoundException,
  MissingFieldsException,
  InvalidOldPasswordException,
} from '../common/exceptions';
import { Storage } from '../storage/Storage';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(@Inject('STORAGE') private readonly storage: Storage) {}

  getAll(): UserResponseDto[] {
    const users = this.storage.users.findAll();
    return plainToInstance(UserResponseDto, users);
  }

  getById(id: string): UserResponseDto {
    const user = this.getFullUserById(id);
    return plainToInstance(UserResponseDto, user);
  }

  create(dto: CreateUserDto): UserResponseDto {
    if (!dto.login || !dto.password) throw MissingFieldsException();

    const newUser: User = {
      id: uuidv4(),
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const user = this.storage.users.create(newUser);
    return plainToInstance(UserResponseDto, user);
  }

  updatePassword(id: string, dto: UpdatePasswordDto): UserResponseDto {
    const user = this.getFullUserById(id);

    if (user.password !== dto.oldPassword) throw InvalidOldPasswordException();

    user.password = dto.newPassword;
    user.version++;
    user.updatedAt = Date.now();
    const updUser = this.storage.users.update(user);
    return plainToInstance(UserResponseDto, updUser);
  }

  delete(id: string): void {
    const user = this.getFullUserById(id);
    return this.storage.users.delete(user.id);
  }

  private getFullUserById(id: string): User {
    if (!isUUID(id)) throw InvalidUUIDException();
    const user = this.storage.users.findById(id);
    if (!user) throw UserNotFoundException();
    return user;
  }
}
