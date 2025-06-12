import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaFaceReferenceRepository } from './database/reference.repository.prisma';
import { FindFaceReferenceHttpController } from './queries/find-face-refereneces/find-references.http.controller';
import { CreateFaceReferenceHttpController } from './commands/create-face-reference/create-face-reference.http.controller';
import { UpdateFaceReferenceHttpController } from './commands/update-face-reference/update-face-reference.http.controller';
import { DeleteFaceReferenceHttpController } from './commands/delete-face-reference/delete-face-reference.http.controller';
import { CreateFaceReferenceService } from './commands/create-face-reference/create-face-reference.service';
import { UpdateFaceReferenceService } from './commands/update-face-reference/update-face-reference.service';
import { DeleteFaceReferenceService } from './commands/delete-face-reference/delete-face-reference.service';
import { FindFaceReferenceQueryHandler } from './queries/find-face-refereneces/find-references.query-handler';
import { FaceReferenceMapper } from './mappers/reference.mapper';
import { FACE_REFERENCE_REPOSITORY } from './face-reference.di-tokens';
import { GenerateCode } from '@src/libs/utils/generate-code.util';

const httpControllers = [
  FindFaceReferenceHttpController,
  CreateFaceReferenceHttpController,
  UpdateFaceReferenceHttpController,
  DeleteFaceReferenceHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateFaceReferenceService,
  UpdateFaceReferenceService,
  DeleteFaceReferenceService,
];

const queryHandlers: Provider[] = [FindFaceReferenceQueryHandler];

const mappers: Provider[] = [FaceReferenceMapper];

const repositories: Provider[] = [
  {
    provide: FACE_REFERENCE_REPOSITORY,
    useClass: PrismaFaceReferenceRepository,
  },
];

const utils: Provider[] = [GenerateCode];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
    ...utils,
  ],
  exports: [...repositories, ...mappers],
})
export class FaceReferenceModule {}
