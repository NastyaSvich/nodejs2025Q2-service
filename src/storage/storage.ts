import { Track } from '../track/entities/track.entity';
import { User } from '../user/entities/user.entity';
import { Artist } from '../artist/entities/artist.entity';
import { Album } from '../album/entities/album.entity';
import { Favorites } from '../favorites/entities/favorites.entity';

export type Storage = {
  users: User[];
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  favorites: Favorites;
};

export const storage: Storage = {
  users: [],
  tracks: [],
  artists: [],
  albums: [],
  favorites: {
    artists: [],
    albums: [],
    tracks: [],
  },
};
