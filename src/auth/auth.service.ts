import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserService } from '../user/user.service';

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

  async signup(login: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await this.usersService.create({ login, password: hash });
    const user = await this.usersService.findByLogin(login);
    return plainToInstance(UserResponseDto, user);
  }

  async validateUser(login: string, password: string) {
    const user = await this.usersService.findByLogin(login);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid login or password');
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
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException('Refresh token expired', HttpStatus.FORBIDDEN);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
      }
      throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
    }
  }
}
