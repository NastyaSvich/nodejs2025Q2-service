import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Favorites } from '../../favorites/entities/favorites.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  grammy: boolean;

  @ManyToMany(() => Favorites, (favorites) => favorites.artists)
  favorites: Favorites[];
}
