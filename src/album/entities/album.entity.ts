import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column('uuid', { nullable: true })
  artistId: string | null;
}
