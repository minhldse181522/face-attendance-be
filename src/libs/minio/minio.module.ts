import { Module } from '@nestjs/common';
import { MinioModuleClass } from './minio.module-definition';
import { MinioService } from './minio.service';

@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule extends MinioModuleClass {}
