import { Module } from '@nestjs/common';
import { storage } from './Storage';

@Module({
  providers: [
    {
      provide: 'STORAGE',
      useValue: storage,
    },
  ],
  exports: ['STORAGE'],
})
export class StorageModule {}
