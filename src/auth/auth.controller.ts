import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  MissingFieldsException,
  MissingRefreshTokenException,
} from '../common/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() dto: SignupDto) {
    if (!dto.login || !dto.password) {
      throw MissingFieldsException();
    }

    return this.authService.signup(dto.login, dto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    if (!dto.login || !dto.password) {
      throw MissingFieldsException();
    }

    const user = await this.authService.validateUser(dto.login, dto.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw MissingRefreshTokenException();
    }
    return this.authService.refresh(refreshToken);
  }
}
