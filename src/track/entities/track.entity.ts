import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Favorites } from '../../favorites/entities/favorites.entity';
import { Artist } from '../../artist/entities/artist.entity';
import { Album } from '../../album/entities/album.entity';

@Entity()
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Artist, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  artist: Artist | null;

  @ManyToOne(() => Album, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  album: Album | null;

  @Column()
  duration: number;

  @ManyToMany(() => Favorites, (favorites) => favorites.tracks)
  favorites: Favorites[];
}
