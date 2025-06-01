import { User } from '../user/entities/user.entity';

export class Users {
  private users: User[] = [];

  findAll(): User[] {
    return [...this.users];
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(user: User): User {
    this.users.push(user);
    return user;
  }

  update(user: User): User {
    const index = this.users.findIndex((u) => u.id === user.id);
    this.users[index] = user;
    return user;
  }

  delete(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
