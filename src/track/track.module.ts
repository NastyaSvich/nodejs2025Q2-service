import { Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './entities/track.entity';
import { Artist } from '../artist/entities/artist.entity';
import { Album } from '../album/entities/album.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Artist, Album])],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
