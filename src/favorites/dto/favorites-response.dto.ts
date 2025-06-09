import { Exclude, Expose } from 'class-transformer';
import { ArtistResponseDto } from '../../artist/dto/artist-response.dto';
import { AlbumResponseDto } from '../../album/dto/album-response.dto';
import { TrackResponseDto } from '../../track/dto/track-response.dto';

@Exclude()
export class FavoritesResponseDto {
  @Expose()
  artists: ArtistResponseDto[];

  @Expose()
  albums: AlbumResponseDto[];

  @Expose()
  tracks: TrackResponseDto[];

  constructor(partial: Partial<FavoritesResponseDto>) {
    Object.assign(this, partial);
  }
}
