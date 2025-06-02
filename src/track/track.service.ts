import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUUID } from 'uuid';
import { Track } from './entities/track.entity';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import {
  InvalidUUIDException,
  MissingFieldsException,
  TrackNotFoundException,
} from '../common/exceptions';
import { Storage } from '../storage/Storage';
import { plainToInstance } from 'class-transformer';
import { TrackResponseDto } from './dto/track-response.dto';

@Injectable()
export class TrackService {
  constructor(@Inject('STORAGE') private readonly storage: Storage) {}

  getAll(): TrackResponseDto[] {
    return plainToInstance(TrackResponseDto, this.storage.tracks);
  }

  getById(id: string): TrackResponseDto {
    const track = this.getTrackOrThrow(id);
    return plainToInstance(TrackResponseDto, track);
  }

  create(dto: CreateTrackDto): TrackResponseDto {
    this.validateOnRequiredFields(dto);

    const newTrack: Track = {
      id: uuidv4(),
      name: dto.name,
      artistId: dto.artistId ?? null,
      albumId: dto.albumId ?? null,
      duration: dto.duration,
    };

    this.storage.tracks.push(newTrack);
    return plainToInstance(TrackResponseDto, newTrack);
  }

  update(id: string, dto: UpdateTrackDto): TrackResponseDto {
    this.validateOnRequiredFields(dto);

    const track = this.getTrackOrThrow(id);

    Object.assign(track, dto);

    return plainToInstance(TrackResponseDto, track);
  }

  delete(id: string): void {
    const track = this.getTrackOrThrow(id);
    this.storage.tracks = this.storage.tracks.filter((t) => t.id !== track.id);
  }

  private getTrackOrThrow(id: string): Track {
    if (!isUUID(id)) throw InvalidUUIDException();
    const track = this.storage.tracks.find((track) => track.id === id);
    if (!track) throw TrackNotFoundException();
    return track;
  }

  private validateOnRequiredFields<T extends Omit<Track, 'id'>>(dto: T) {
    if (!dto.name || dto.duration === undefined) throw MissingFieldsException();
  }
}
