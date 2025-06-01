import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'User login' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'strongpassword123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
