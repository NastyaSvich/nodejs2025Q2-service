import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class AlbumResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  year: number;

  @Expose()
  artistId: string | null;

  constructor(partial: Partial<AlbumResponseDto>) {
    Object.assign(this, partial);
  }
}
