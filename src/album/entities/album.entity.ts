import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Favorites } from '../../favorites/entities/favorites.entity';
import { Artist } from '../../artist/entities/artist.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @ManyToOne(() => Artist, {
    nullable: true,
    onDelete: 'SET NULL',
    eager: false,
  })
  artist: Artist | null;

  @ManyToMany(() => Favorites, (favorites) => favorites.albums)
  favorites: Favorites[];
}
