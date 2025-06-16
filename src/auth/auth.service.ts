import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserService } from '../user/user.service';
import {
  InvalidLoginOrPasswordException,
  InvalidRefreshTokenException,
} from '../common/exceptions';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  config: ConfigService;
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    config: ConfigService,
  ) {
    this.config = config;
  }

  async signup(login: string, password: string): Promise<UserResponseDto> {
    const salt = Number(this.config.get<string>('CRYPT_SALT'));
    const hashPassword = await bcrypt.hash(password, salt);
    return await this.usersService.create({ login, password: hashPassword });
  }

  async validateUser(login: string, password: string): Promise<User> {
    const user = await this.usersService.findByLogin(login);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw InvalidLoginOrPasswordException();
    }

    return user;
  }

  async login(user: { id: string; login: string }) {
    const payload = { userId: user.id, login: user.login };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: this.config.get<string>('TOKEN_EXPIRE_TIME'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.config.get<string>('TOKEN_REFRESH_EXPIRE_TIME'),
      }),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      return this.login({ id: payload.userId, login: payload.login });
    } catch {
      throw InvalidRefreshTokenException();
    }
  }
}
