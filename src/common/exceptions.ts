import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  UnauthorizedException,
} from '@nestjs/common';

export const InvalidUUIDException = () =>
  new BadRequestException('Invalid UUID');

export const MissingFieldsException = () =>
  new BadRequestException('Missing required fields');

export const InvalidOldPasswordException = () =>
  new ForbiddenException('Old password is incorrect');

export const UserNotFoundException = () =>
  new NotFoundException('User not found');

export const TrackNotFoundException = () =>
  new NotFoundException('Tracks not found');

export const ArtistNotFoundException = () =>
  new NotFoundException('Artist not found');

export const AlbumNotFoundException = () =>
  new NotFoundException('Album not found');

export const EntityNotFoundException = () =>
  new UnprocessableEntityException('Unprocessable entity');

export const MissingRefreshTokenException = () =>
  new UnauthorizedException('Refresh token is required');

export const InvalidLoginOrPasswordException = () =>
  new UnauthorizedException('Invalid login or password');

export const InvalidRefreshTokenException = () =>
  new ForbiddenException('Invalid refresh token');
