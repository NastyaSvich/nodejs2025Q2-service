import { Expose, Exclude, Transform } from 'class-transformer';
import { Artist } from '../../artist/entities/artist.entity';

@Exclude()
export class AlbumResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  year: number;

  @Transform(
    ({ obj }: { obj: { artist?: Artist | null } }) => obj.artist?.id ?? null,
  )
  @Expose()
  artistId: string | null;

  constructor(partial: Partial<AlbumResponseDto>) {
    Object.assign(this, partial);
  }
}
