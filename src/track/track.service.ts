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
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ARTIST_DELETED_EVENT } from '../artist/artist.service';
import { ALBUM_DELETED_EVENT } from '../album/album.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export const TRACK_DELETED_EVENT = 'track.deleted' as const;

@Injectable()
export class TrackService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    private readonly emitter: EventEmitter2,
  ) {}

  @OnEvent(ARTIST_DELETED_EVENT)
  async onArtistDeleted(id: string) {
    await this.trackRepository.update({ artistId: id }, { artistId: null });
  }

  @OnEvent(ALBUM_DELETED_EVENT)
  async onAlbumDeleted(id: string) {
    await this.trackRepository.update({ albumId: id }, { albumId: null });
  }

  async getAll(): Promise<TrackResponseDto[]> {
    const tracks = await this.trackRepository.find();
    return plainToInstance(TrackResponseDto, tracks);
  }

  async getById(id: string): Promise<TrackResponseDto> {
    const track = await this.getTrackOrThrow(id);
    return plainToInstance(TrackResponseDto, track);
  }

  async create(dto: CreateTrackDto): Promise<TrackResponseDto> {
    this.validateOnRequiredFields(dto);

    const newTrack = this.trackRepository.create({
      id: uuidv4(),
      name: dto.name,
      artistId: dto.artistId ?? null,
      albumId: dto.albumId ?? null,
      duration: dto.duration,
    });

    const savedTrack = await this.trackRepository.save(newTrack);
    return plainToInstance(TrackResponseDto, savedTrack);
  }

  async update(id: string, dto: UpdateTrackDto): Promise<TrackResponseDto> {
    this.validateOnRequiredFields(dto);
    await this.getTrackOrThrow(id);

    const updatedTrack = await this.trackRepository.update(id, dto);
    return plainToInstance(TrackResponseDto, updatedTrack);
  }

  async delete(id: string): Promise<void> {
    await this.getTrackOrThrow(id);
    await this.trackRepository.delete(id);
    this.emitter.emit(TRACK_DELETED_EVENT, id);
  }

  private async getTrackOrThrow(id: string): Promise<Track> {
    if (!isUUID(id)) throw InvalidUUIDException();
    const track = await this.trackRepository.findOneBy({ id });
    if (!track) throw TrackNotFoundException();
    return track;
  }

  private validateOnRequiredFields<T extends Omit<Track, 'id'>>(dto: T) {
    if (!dto.name || dto.duration === undefined) throw MissingFieldsException();
  }
}
