import { Track } from '../track/entities/track.entity';
import { User } from '../user/entities/user.entity';
import { Artist } from '../artist/entities/artist.entity';
import { Album } from '../album/entities/album.entity';

class StorageManager<T extends { id: string }> {
  private items: Array<T> = [];

  findAll(): Array<T> {
    return [...this.items];
  }

  findById(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  create(item: T): T {
    this.items.push(item);
    return item;
  }

  update(item: T): T {
    const index = this.items.findIndex((tr) => tr.id === item.id);
    this.items[index] = item;
    return item;
  }

  delete(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export type Storage = {
  users: StorageManager<User>;
  tracks: StorageManager<Track>;
  artists: StorageManager<Artist>;
  albums: StorageManager<Album>;
};

export const storage: Storage = {
  users: new StorageManager(),
  tracks: new StorageManager(),
  artists: new StorageManager(),
  albums: new StorageManager(),
};
