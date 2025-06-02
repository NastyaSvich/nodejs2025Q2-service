import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import {
  InvalidUUIDException,
  MissingFieldsException,
  ArtistNotFoundException,
} from '../common/exceptions';
import { Storage } from '../storage/Storage';
import { plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArtistResponseDto } from './dto/artist-response.dto';

export const ARTIST_DELETED_EVENT = 'artist.deleted' as const;

@Injectable()
export class ArtistService {
  constructor(
    @Inject('STORAGE') private readonly storage: Storage,
    private readonly emitter: EventEmitter2,
  ) {}

  getAll(): ArtistResponseDto[] {
    return plainToInstance(ArtistResponseDto, this.storage.artists);
  }

  getById(id: string): ArtistResponseDto {
    const artist = this.getArtistOrThrow(id);
    return plainToInstance(ArtistResponseDto, artist);
  }

  create(dto: CreateArtistDto): ArtistResponseDto {
    this.validateOnRequiredFields(dto);

    const newArtist: Artist = {
      id: uuidv4(),
      name: dto.name,
      grammy: dto.grammy,
    };

    this.storage.artists.push(newArtist);
    return plainToInstance(ArtistResponseDto, newArtist);
  }

  update(id: string, dto: UpdateArtistDto): ArtistResponseDto {
    this.validateOnRequiredFields(dto);

    const artist = this.getArtistOrThrow(id);
    Object.assign(artist, dto);

    return plainToInstance(ArtistResponseDto, artist);
  }

  delete(id: string): void {
    const artist = this.getArtistOrThrow(id);
    this.storage.artists = this.storage.artists.filter(
      (a) => a.id !== artist.id,
    );
    this.emitter.emit(ARTIST_DELETED_EVENT, id);
  }

  private getArtistOrThrow(id: string): Artist {
    if (!isUUID(id)) throw InvalidUUIDException();
    const artist = this.storage.artists.find((artist) => artist.id === id);
    if (!artist) throw ArtistNotFoundException();
    return artist;
  }

  private validateOnRequiredFields<T extends Omit<Artist, 'id'>>(dto: T) {
    if (!dto.name || dto.grammy === undefined) throw MissingFieldsException();
  }
}
