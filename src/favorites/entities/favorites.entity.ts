import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Favorites {
  @PrimaryColumn('uuid', { array: true, default: () => 'ARRAY[]::UUID[]' })
  artists: string[];

  @Column('uuid', { array: true, default: () => 'ARRAY[]::UUID[]' })
  albums: string[];

  @Column('uuid', { array: true, default: () => 'ARRAY[]::UUID[]' })
  tracks: string[];
}
