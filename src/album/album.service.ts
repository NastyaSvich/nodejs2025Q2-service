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
import { AlbumResponseDto } from './dto/album-response.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ARTIST_DELETED_EVENT } from '../artist/artist.service';

export const ALBUM_DELETED_EVENT = 'album.deleted' as const;

@Injectable()
export class AlbumService {
  constructor(
    @Inject('STORAGE') private readonly storage: Storage,
    private readonly emitter: EventEmitter2,
  ) {}

  @OnEvent(ARTIST_DELETED_EVENT)
  onArtistDeleted(id: string) {
    this.storage.albums.forEach((album: Album) => {
      if (album.artistId === id) {
        album.artistId = null;
      }
    });
  }

  getAll(): AlbumResponseDto[] {
    return plainToInstance(AlbumResponseDto, this.storage.albums);
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

    this.storage.albums.push(newAlbum);
    return plainToInstance(AlbumResponseDto, newAlbum);
  }

  update(id: string, dto: UpdateAlbumDto): AlbumResponseDto {
    this.validateOnRequiredFields(dto);

    const album = this.getAlbumOrThrow(id);
    Object.assign(album, dto);

    return plainToInstance(AlbumResponseDto, album);
  }

  delete(id: string): void {
    const album = this.getAlbumOrThrow(id);
    this.storage.albums = this.storage.albums.filter((a) => a.id !== album.id);
    this.emitter.emit(ALBUM_DELETED_EVENT, id);
  }

  private getAlbumOrThrow(id: string): Album {
    if (!isUUID(id)) throw InvalidUUIDException();
    const album = this.storage.albums.find((album) => album.id === id);
    if (!album) throw AlbumNotFoundException();
    return album;
  }

  private validateOnRequiredFields<T extends Omit<Album, 'id'>>(dto: T) {
    if (!dto.name) throw MissingFieldsException();
  }
}
