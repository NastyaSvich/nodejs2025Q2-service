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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from '../artist/entities/artist.entity';

@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async getAll(): Promise<AlbumResponseDto[]> {
    const albums = await this.albumRepository.find({ relations: ['artist'] });
    return plainToInstance(AlbumResponseDto, albums);
  }

  async getById(id: string): Promise<AlbumResponseDto> {
    const album = await this.getAlbumOrThrow(id);
    return plainToInstance(AlbumResponseDto, album);
  }

  async create(dto: CreateAlbumDto): Promise<AlbumResponseDto> {
    this.validateOnRequiredFields(dto);

    const artist = dto.artistId
      ? await this.artistRepository.findOne({ where: { id: dto.artistId } })
      : null;

    const newAlbum = this.albumRepository.create({
      id: uuidv4(),
      name: dto.name,
      year: dto.year,
      artist: artist,
    });

    const savedAlbum = await this.albumRepository.save(newAlbum);
    return plainToInstance(AlbumResponseDto, savedAlbum);
  }

  async update(id: string, dto: UpdateAlbumDto): Promise<AlbumResponseDto> {
    this.validateOnRequiredFields(dto);
    const album = await this.getAlbumOrThrow(id);

    const artist = dto.artistId
      ? await this.artistRepository.findOneBy({ id: dto.artistId })
      : null;

    album.name = dto.name;
    album.year = dto.year;
    album.artist = artist;

    const updatedAlbum = await this.albumRepository.save(album);
    return plainToInstance(AlbumResponseDto, updatedAlbum);
  }

  async delete(id: string): Promise<void> {
    await this.getAlbumOrThrow(id);
    await this.albumRepository.delete(id);
  }

  private async getAlbumOrThrow(id: string): Promise<Album> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const album = await this.albumRepository.findOne({
      where: { id },
      relations: ['artist'],
    });
    if (!album) throw AlbumNotFoundException();
    return album;
  }

  private validateOnRequiredFields<T extends Partial<Album>>(dto: T) {
    if (!dto.name) throw MissingFieldsException();
  }
}
