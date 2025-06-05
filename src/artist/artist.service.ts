import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import {
  InvalidUUIDException,
  MissingFieldsException,
  ArtistNotFoundException,
} from '../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArtistResponseDto } from './dto/artist-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const ARTIST_DELETED_EVENT = 'artist.deleted' as const;

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    private readonly emitter: EventEmitter2,
  ) {}

  async getAll(): Promise<ArtistResponseDto[]> {
    const artists = await this.artistRepository.find();
    return plainToInstance(ArtistResponseDto, artists);
  }

  async getById(id: string): Promise<ArtistResponseDto> {
    const artist = await this.getArtistOrThrow(id);
    return plainToInstance(ArtistResponseDto, artist);
  }

  async create(dto: CreateArtistDto): Promise<ArtistResponseDto> {
    this.validateOnRequiredFields(dto);

    const newArtist: Artist = {
      id: uuidv4(),
      name: dto.name,
      grammy: dto.grammy,
    };

    const savedArtist = await this.artistRepository.save(newArtist);
    return plainToInstance(ArtistResponseDto, savedArtist);
  }

  async update(id: string, dto: UpdateArtistDto): Promise<ArtistResponseDto> {
    this.validateOnRequiredFields(dto);
    await this.getArtistOrThrow(id);

    const updatedArtist = await this.artistRepository.update(id, dto);
    return plainToInstance(ArtistResponseDto, updatedArtist);
  }

  async delete(id: string): Promise<void> {
    await this.getArtistOrThrow(id);
    await this.artistRepository.delete(id);
    this.emitter.emit(ARTIST_DELETED_EVENT, id);
  }

  private async getArtistOrThrow(id: string): Promise<Artist> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const artist = await this.artistRepository.findOneBy({ id });
    if (!artist) throw ArtistNotFoundException();
    return artist;
  }

  private validateOnRequiredFields<T extends Omit<Artist, 'id'>>(dto: T) {
    if (!dto.name || dto.grammy === undefined) throw MissingFieldsException();
  }
}
