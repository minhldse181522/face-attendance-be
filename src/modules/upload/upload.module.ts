import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateSignedUrlHttpController } from './command/create-signed-url/create-signed-url.http.controller';
import { DeleteObjectHttpController } from './command/delete-object/delete-object.http.controller';
import { DeleteObjectService } from './command/delete-object/delete-object.service';
import { DirectUploadHttpController } from './command/direct-upload/direct-upload.http.controller';
import { DirectUploadService } from './command/direct-upload/direct-upload.service';
import { DownloadHttpController } from './command/download/download.http.controller';
import { DownloadService } from './command/download/download.service';
import { MoveObjectHttpController } from './command/move-object/move-object.http.controller';
import { MoveObjectService } from './command/move-object/move-object.service';
import { GetObjectInBucketHttpController } from './queries/get-object-in-bucket/get-object-in-bucket.http.controller';
import { GetObjectInBucketService } from './queries/get-object-in-bucket/get-object-in-bucket.service';
import { UserModule } from '../user/user.module';

const httpControllers = [
  CreateSignedUrlHttpController,
  MoveObjectHttpController,
  GetObjectInBucketHttpController,
  DeleteObjectHttpController,
  DirectUploadHttpController,

  // CreateImageStorageHttpController,
  // FindImageStoragesHttpController,
  // FindImageStoragesForEcmHttpController,
  // FindImageStorageHttpController,
  // UpdateImageStorageHttpController,
  // DeleteImageStorageHttpController,

  // DirectUploadHttpController,
  DownloadHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const commandHandlers: Provider[] = [
  MoveObjectService,
  GetObjectInBucketService,
  DeleteObjectService,

  // CreateImageStorageService,
  // UpdateImageStorageService,
  // DeleteImageStorageService,

  DirectUploadService,
  DownloadService,
];

const queryHandlers: Provider[] = [
  // FindImageStorageQueryHandler,
  // FindImageStoragesQueryHandler,
];

// const mappers: Provider[] = [ImageStorageMapper];

const utils: Provider[] = [];

const repositories: Provider[] = [
  // {
  //   provide: IMAGE_STORAGE_REPOSITORY,
  //   useClass: PrismaImageStorageRepository,
  // },
];

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    // ...mappers,
    ...utils,
  ],
  exports: [...repositories, ...utils],
})
export class UploadModule {}
