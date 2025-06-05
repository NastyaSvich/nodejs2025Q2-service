import { Entity, PrimaryGeneratedColumn, Column, VersionColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  password: string;

  @Column()
  version: number;

  @Column('bigint', {
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  createdAt: number;

  @Column('bigint', {
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  updatedAt: number;
}
