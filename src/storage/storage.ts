import { Users } from './users';

export type Storage = {
  users: Users;
};

export const storage: Storage = {
  users: new Users(),
};
