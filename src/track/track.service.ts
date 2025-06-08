import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import {
  InvalidUUIDException,
  MissingFieldsException,
  TrackNotFoundException,
} from '../common/exceptions';
import { plainToInstance } from 'class-transformer';
import { TrackResponseDto } from './dto/track-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from '../artist/entities/artist.entity';
import { Album } from '../album/entities/album.entity';

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  async getAll(): Promise<TrackResponseDto[]> {
    const tracks = await this.trackRepository.find({
      relations: ['artist', 'album'],
    });
    return plainToInstance(TrackResponseDto, tracks);
  }

  async getById(id: string): Promise<TrackResponseDto> {
    const track = await this.getTrackOrThrow(id);
    return plainToInstance(TrackResponseDto, track);
  }

  async create(dto: CreateTrackDto): Promise<TrackResponseDto> {
    this.validateOnRequiredFields(dto);

    const artist = dto.artistId
      ? await this.artistRepository.findOne({ where: { id: dto.artistId } })
      : null;

    const album = dto.albumId
      ? await this.albumRepository.findOne({ where: { id: dto.albumId } })
      : null;

    const newTrack = this.trackRepository.create({
      id: uuidv4(),
      name: dto.name,
      artist,
      album,
      duration: dto.duration,
    });

    const savedTrack = await this.trackRepository.save(newTrack);
    return plainToInstance(TrackResponseDto, savedTrack);
  }

  async update(id: string, dto: UpdateTrackDto): Promise<TrackResponseDto> {
    this.validateOnRequiredFields(dto);
    const track = await this.getTrackOrThrow(id);

    const artist = dto.artistId
      ? await this.artistRepository.findOneBy({ id: dto.artistId })
      : null;

    const album = dto.albumId
      ? await this.albumRepository.findOneBy({ id: dto.albumId })
      : null;

    track.name = dto.name;
    track.duration = dto.duration;
    track.artist = artist;
    track.album = album;

    const updatedTrack = await this.trackRepository.save(track);
    return plainToInstance(TrackResponseDto, updatedTrack);
  }

  async delete(id: string): Promise<void> {
    await this.getTrackOrThrow(id);
    await this.trackRepository.delete(id);
  }

  private async getTrackOrThrow(id: string): Promise<Track> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const track = await this.trackRepository.findOne({
      where: { id },
      relations: ['artist', 'album'],
    });
    if (!track) throw TrackNotFoundException();
    return track;
  }

  private validateOnRequiredFields<T extends Partial<Track>>(dto: T) {
    if (!dto.name || dto.duration === undefined) throw MissingFieldsException();
  }
}
