import { Artist } from '../../artist/entities/artist.entity';
import { Album } from '../../album/entities/album.entity';
import { Track } from '../../track/entities/track.entity';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FavoritesResponseDto {
  @Expose()
  artists: Artist[];

  @Expose()
  albums: Album[];

  @Expose()
  tracks: Track[];

  constructor(partial: Partial<FavoritesResponseDto>) {
    Object.assign(this, partial);
  }
}
