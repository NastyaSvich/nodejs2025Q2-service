import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorites } from './entities/favorites.entity';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([Favorites])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
