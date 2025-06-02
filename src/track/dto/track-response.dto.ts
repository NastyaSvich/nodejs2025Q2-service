import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class TrackResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  artistId: string | null;

  @Expose()
  albumId: string | null;

  @Expose()
  duration: number;

  constructor(partial: Partial<TrackResponseDto>) {
    Object.assign(this, partial);
  }
}
