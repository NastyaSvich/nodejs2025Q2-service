import { Expose, Exclude, Transform } from 'class-transformer';
import { Artist } from '../../artist/entities/artist.entity';
import { Album } from '../../album/entities/album.entity';

@Exclude()
export class TrackResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Transform(
    ({ obj }: { obj: { artist?: Artist | null } }) => obj.artist?.id ?? null,
  )
  @Expose()
  artistId: string | null;

  @Transform(
    ({ obj }: { obj: { album?: Album | null } }) => obj.album?.id ?? null,
  )
  @Expose()
  albumId: string | null;

  @Expose()
  duration: number;

  constructor(partial: Partial<TrackResponseDto>) {
    Object.assign(this, partial);
  }
}
