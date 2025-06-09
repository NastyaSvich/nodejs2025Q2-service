import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class ArtistResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  grammy: boolean;

  constructor(partial: Partial<ArtistResponseDto>) {
    Object.assign(this, partial);
  }
}
