import { Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { Artist } from '../../artist/entities/artist.entity';
import { Album } from '../../album/entities/album.entity';
import { Track } from '../../track/entities/track.entity';

@Entity()
export class Favorites {
  @PrimaryColumn({ default: 'default' })
  id: string;

  @ManyToMany(() => Artist, { eager: true })
  @JoinTable()
  artists: Artist[];

  @ManyToMany(() => Album, { eager: true })
  @JoinTable()
  albums: Album[];

  @ManyToMany(() => Track, { eager: true })
  @JoinTable()
  tracks: Track[];
}
