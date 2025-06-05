import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Album } from './entities/album.entity';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import {
  AlbumNotFoundException,
  InvalidUUIDException,
  MissingFieldsException,
} from '../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { AlbumResponseDto } from './dto/album-response.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ARTIST_DELETED_EVENT } from '../artist/artist.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const ALBUM_DELETED_EVENT = 'album.deleted' as const;

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    private readonly emitter: EventEmitter2,
  ) {}

  @OnEvent(ARTIST_DELETED_EVENT)
  async onArtistDeleted(id: string) {
    await this.albumRepository.update({ artistId: id }, { artistId: null });
  }

  async getAll(): Promise<AlbumResponseDto[]> {
    const albums = await this.albumRepository.find();
    return plainToInstance(AlbumResponseDto, albums);
  }

  async getById(id: string): Promise<AlbumResponseDto> {
    const album = await this.getAlbumOrThrow(id);
    return plainToInstance(AlbumResponseDto, album);
  }

  async create(dto: CreateAlbumDto): Promise<AlbumResponseDto> {
    this.validateOnRequiredFields(dto);

    const newAlbum = this.albumRepository.create({
      id: uuidv4(),
      name: dto.name,
      year: dto.year,
      artistId: dto.artistId ?? null,
    });

    const savedAlbum = await this.albumRepository.save(newAlbum);
    return plainToInstance(AlbumResponseDto, savedAlbum);
  }

  async update(id: string, dto: UpdateAlbumDto): Promise<AlbumResponseDto> {
    this.validateOnRequiredFields(dto);
    await this.getAlbumOrThrow(id);

    const updatedAlbum = this.albumRepository.update(id, dto);
    return plainToInstance(AlbumResponseDto, updatedAlbum);
  }

  async delete(id: string): Promise<void> {
    await this.getAlbumOrThrow(id);
    await this.albumRepository.delete(id);
    this.emitter.emit(ALBUM_DELETED_EVENT, id);
  }

  private async getAlbumOrThrow(id: string): Promise<Album> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const album = await this.albumRepository.findOneBy({ id });
    if (!album) throw AlbumNotFoundException();
    return album;
  }

  private validateOnRequiredFields<T extends Omit<Album, 'id'>>(dto: T) {
    if (!dto.name) throw MissingFieldsException();
  }
}
