import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

export const InvalidUUIDException = () =>
  new BadRequestException('Invalid UUID');

export const UserNotFoundException = () =>
  new NotFoundException('User not found');

export const MissingFieldsException = () =>
  new BadRequestException('Missing required fields');

export const InvalidOldPasswordException = () =>
  new ForbiddenException('Old password is incorrect');
