import { AlbumResponseDto } from './../album/dto/album-response.dto';
import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Album } from 'src/album/entities/album.entity';
import { Artist } from 'src/artist/entities/artist.entity';
import { Track } from 'src/track/entities/track.entity';
import { Favorites } from 'src/favorites/entities/favorites.entity';
import { FavoritesResponseDto } from 'src/favorites/dto/favorites-response.dto';
import { ArtistResponseDto } from 'src/artist/dto/artist-response.dto';
import { TrackResponseDto } from 'src/track/dto/track-response.dto';
import {
  EntityNotFoundException,
  InvalidUUIDException,
} from '../common/exceptions';
import { validate as isUUID } from 'uuid';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(Favorites)
    private readonly favoritesRepository: Repository<Favorites>,
  ) {}

  async getOrCreateFavorites(): Promise<Favorites> {
    let favorites = await this.favoritesRepository.findOne({
      where: { id: 'default' },
      relations: [
        'artists',
        'albums',
        'albums.artist',
        'tracks',
        'tracks.artist',
        'tracks.album',
      ],
    });
    if (!favorites) {
      favorites = this.favoritesRepository.create({
        id: 'default',
        artists: [],
        albums: [],
        tracks: [],
      });
      await this.favoritesRepository.save(favorites);
    }
    return favorites!;
  }

  async getAll(): Promise<FavoritesResponseDto> {
    const favorites = await this.getOrCreateFavorites();

    return {
      artists: plainToInstance(ArtistResponseDto, favorites?.artists || []),
      albums: plainToInstance(AlbumResponseDto, favorites?.albums) || [],
      tracks: plainToInstance(TrackResponseDto, favorites?.tracks || []),
    };
  }

  async addTrack(id: string): Promise<void> {
    await this.add(id, 'tracks', this.trackRepository);
  }

  async deleteTrack(id: string): Promise<void> {
    await this.delete(id, 'tracks');
  }

  async addAlbum(id: string): Promise<void> {
    await this.add(id, 'albums', this.albumRepository);
  }

  async deleteAlbum(id: string): Promise<void> {
    await this.delete(id, 'albums');
  }

  async addArtist(id: string): Promise<void> {
    await this.add(id, 'artists', this.artistRepository);
  }

  async deleteArtist(id: string): Promise<void> {
    await this.delete(id, 'artists');
  }

  private async add<T extends Artist | Album | Track>(
    id: string,
    entityType: keyof Favorites,
    repository: Repository<T>,
  ): Promise<void> {
    if (!isUUID(id)) throw InvalidUUIDException();

    const entity = await repository.findOneBy({ id } as FindOptionsWhere<T>);
    if (!entity) {
      throw EntityNotFoundException();
    }

    const favorites = await this.getOrCreateFavorites();
    const entities = favorites[entityType] as T[];

    if (!entities.some((e) => e.id === id)) {
      entities.push(entity);
      await this.favoritesRepository.save(favorites);
    }
  }

  private async delete(id: string, entityType: keyof Favorites): Promise<void> {
    if (!isUUID(id)) throw InvalidUUIDException();

    const favorites = await this.getOrCreateFavorites();
    const entities = favorites[entityType] as { id: string }[];

    const index = entities.findIndex((e) => e.id === id);
    if (index === -1) throw EntityNotFoundException();

    entities.splice(index, 1);
    await this.favoritesRepository.save(favorites);
  }
}
