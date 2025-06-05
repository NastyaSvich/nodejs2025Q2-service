import { Module } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([Artist])],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}
