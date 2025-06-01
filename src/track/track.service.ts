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
    const tracks = this.storage.tracks.findAll();
    return plainToInstance(TrackResponseDto, tracks);
  }

  getById(id: string): TrackResponseDto {
    const track = this.getFullTrackById(id);
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

    const track = this.storage.tracks.create(newTrack);
    return plainToInstance(TrackResponseDto, track);
  }

  update(id: string, dto: UpdateTrackDto): TrackResponseDto {
    this.validateOnRequiredFields(dto);

    const track = this.getFullTrackById(id);

    Object.assign(track, {
      ...dto,
    });

    const updatedTrack = this.storage.tracks.update(track);
    return plainToInstance(TrackResponseDto, updatedTrack);
  }

  delete(id: string): void {
    const track = this.getFullTrackById(id);
    this.storage.tracks.delete(track.id);
  }

  private getFullTrackById(id: string): Track {
    if (!isUUID(id)) throw InvalidUUIDException();
    const track = this.storage.tracks.findById(id);
    if (!track) throw TrackNotFoundException();
    return track;
  }

  private validateOnRequiredFields<T extends Omit<Track, 'id'>>(dto: T) {
    if (!dto.name || dto.duration === undefined) throw MissingFieldsException();
  }
}
