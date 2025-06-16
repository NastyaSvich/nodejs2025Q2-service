import { Injectable } from '@nestjs/common';
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
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return plainToInstance(UserResponseDto, users);
  }

  async getById(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    return plainToInstance(UserResponseDto, user);
  }

  async findByLogin(login: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ login });

    if (!user) {
      throw UserNotFoundException();
    }

    return user;
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    if (!dto.login || !dto.password) throw MissingFieldsException();

    const newUser = this.userRepository.create({
      id: uuidv4(),
      login: dto.login,
      password: dto.password,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const savedUser = await this.userRepository.save(newUser);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<UserResponseDto> {
    if (!dto.oldPassword || !dto.newPassword) throw MissingFieldsException();

    const user = await this.getUserOrThrow(id);

    if (user.password !== dto.oldPassword) throw InvalidOldPasswordException();

    user.password = dto.newPassword;
    user.version++;
    user.updatedAt = Date.now();

    await this.userRepository.update(id, user);
    return plainToInstance(UserResponseDto, user);
  }

  async delete(id: string): Promise<void> {
    await this.getUserOrThrow(id);
    await this.userRepository.delete(id);
  }

  private async getUserOrThrow(id: string): Promise<User> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw UserNotFoundException();
    return user;
  }
}
