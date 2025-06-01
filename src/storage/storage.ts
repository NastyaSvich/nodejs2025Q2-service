import { Users } from './users';
import { Tracks } from './tracks';

export type Storage = {
  users: Users;
  tracks: Tracks;
};

export const storage: Storage = {
  users: new Users(),
  tracks: new Tracks(),
};
