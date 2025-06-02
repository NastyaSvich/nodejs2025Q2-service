import { Inject, Injectable } from '@nestjs/common';
import { validate as isUUID } from 'uuid';
import { Storage } from '../storage/Storage';
import {
  InvalidUUIDException,
  EntityNotFoundException,
} from '../common/exceptions';
import { FavoritesResponseDto } from './dto/favorites-response.dto';
import { Artist } from '../artist/entities/artist.entity';
import { Album } from '../album/entities/album.entity';
import { Track } from '../track/entities/track.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { ARTIST_DELETED_EVENT } from '../artist/artist.service';
import { ALBUM_DELETED_EVENT } from '../album/album.service';
import { TRACK_DELETED_EVENT } from '../track/track.service';

@Injectable()
export class FavoritesService {
  constructor(@Inject('STORAGE') private readonly storage: Storage) {}

  @OnEvent(ARTIST_DELETED_EVENT)
  onArtistDeleted(id: string) {
    const index = this.storage.favorites.artists.indexOf(id);
    if (index !== -1) this.storage.favorites.artists.splice(index, 1);
  }

  @OnEvent(ALBUM_DELETED_EVENT)
  onAlbumDeleted(id: string) {
    const index = this.storage.favorites.albums.indexOf(id);
    if (index !== -1) this.storage.favorites.albums.splice(index, 1);
  }

  @OnEvent(TRACK_DELETED_EVENT)
  onTrackDeleted(id: string) {
    const index = this.storage.favorites.tracks.indexOf(id);
    if (index !== -1) this.storage.favorites.tracks.splice(index, 1);
  }

  getAll(): FavoritesResponseDto {
    const { favorites, tracks, albums, artists } = this.storage;

    const trackList: Track[] = favorites.tracks.map((id) =>
      tracks.find((track) => track.id === id),
    );
    const albumList: Album[] = favorites.albums.map((id) =>
      albums.find((album) => album.id === id),
    );
    const artistList: Artist[] = favorites.artists.map((id) =>
      artists.find((artist) => artist.id === id),
    );

    return {
      tracks: trackList,
      albums: albumList,
      artists: artistList,
    };
  }

  addTrack(id: string) {
    this.add(id, 'tracks', this.storage.tracks);
  }

  deleteTrack(id: string) {
    this.delete(id, 'tracks');
  }

  addAlbum(id: string) {
    this.add(id, 'albums', this.storage.albums);
  }

  deleteAlbum(id: string) {
    this.delete(id, 'albums');
  }

  addArtist(id: string) {
    this.add(id, 'artists', this.storage.artists);
  }

  deleteArtist(id: string) {
    this.delete(id, 'artists');
  }

  private add<T extends Artist | Album | Track>(
    id: string,
    entityType: keyof Storage['favorites'],
    entityStorage: T[],
  ): void {
    if (!isUUID(id)) throw InvalidUUIDException();

    const entity = entityStorage.find((entity) => entity.id === id);

    if (!entity) {
      throw EntityNotFoundException();
    }

    this.storage.favorites[entityType].push(entity.id);
  }

  private delete(
    id: string,
    entityType: keyof typeof this.storage.favorites,
  ): void {
    if (!isUUID(id)) throw InvalidUUIDException();

    const favoritesArray = this.storage.favorites[entityType];
    const index = favoritesArray.indexOf(id);

    if (index === -1) throw EntityNotFoundException();

    favoritesArray.splice(index, 1);
  }
}
