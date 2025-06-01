import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import {
  AlbumNotFoundException,
  InvalidUUIDException,
  MissingFieldsException,
} from '../common/exceptions';
import { Storage } from '../storage/Storage';
import { plainToInstance } from 'class-transformer';
import { TrackResponseDto } from '../track/dto/track-response.dto';
import { AlbumResponseDto } from './dto/album-response.dto';
import { Track } from '../track/entities/track.entity';

@Injectable()
export class AlbumService {
  constructor(@Inject('STORAGE') private readonly storage: Storage) {}

  getAll(): Album[] {
    return this.storage.albums.findAll();
  }

  getById(id: string): AlbumResponseDto {
    const album = this.getAlbumOrThrow(id);
    return plainToInstance(AlbumResponseDto, album);
  }

  create(dto: CreateAlbumDto): AlbumResponseDto {
    this.validateOnRequiredFields(dto);

    const newAlbum: Album = {
      id: uuidv4(),
      name: dto.name,
      year: dto.year,
      artistId: dto.artistId ?? null,
    };

    const album = this.storage.albums.create(newAlbum);
    return plainToInstance(AlbumResponseDto, album);
  }

  update(id: string, dto: UpdateAlbumDto): AlbumResponseDto {
    this.validateOnRequiredFields(dto);

    const album = this.getAlbumOrThrow(id);

    Object.assign(album, {
      ...dto,
    });

    const updatedAlbum = this.storage.albums.update(album);
    return plainToInstance(AlbumResponseDto, updatedAlbum);
  }

  delete(id: string): void {
    const album = this.getAlbumOrThrow(id);
    this.storage.albums.delete(album.id);
  }

  private getAlbumOrThrow(id: string): Album {
    if (!isUUID(id)) throw InvalidUUIDException();
    const album = this.storage.albums.findById(id);
    if (!album) throw AlbumNotFoundException();
    return album;
  }

  private validateOnRequiredFields<T extends Omit<Album, 'id'>>(dto: T) {
    if (!dto.name) throw MissingFieldsException();
  }
}
