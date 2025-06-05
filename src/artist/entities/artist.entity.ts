import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  grammy: boolean;
}
