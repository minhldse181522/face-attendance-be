import { ConflictException, Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionNotFoundError,
  FormDescriptionUpdateNotAllowedError,
} from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { UpdateFormDescriptionCommand } from './update-form-description.command';
import { MinioService } from '@src/libs/minio/minio.service';
import {
  FindUserByParamsQuery,
  FindUserByParamsQueryResult,
} from '@src/modules/user/queries/find-user-by-params/find-user-by-params.query-handler';
import { UserNotFoundError } from '@src/modules/user/domain/user.error';
import { UpdateUserCommand } from '@src/modules/user/commands/update-user/update-user.command';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';

export type UpdateFormDescriptionServiceResult = Result<
  FormDescriptionEntity,
  | FormDescriptionNotFoundError
  | FormDescriptionAlreadyExistsError
  | FormDescriptionUpdateNotAllowedError
  | UserNotFoundError
>;

@CommandHandler(UpdateFormDescriptionCommand)
export class UpdateFormDescriptionService
  implements ICommandHandler<UpdateFormDescriptionCommand>
{
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    private readonly formDescriptionRepo: FormDescriptionRepositoryPort,
    private readonly minioService: MinioService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: UpdateFormDescriptionCommand,
  ): Promise<UpdateFormDescriptionServiceResult> {
    const found = await this.formDescriptionRepo.findOneById(
      command.formDescriptionId,
    );
    if (found.isNone()) {
      return Err(new FormDescriptionNotFoundError());
    }

    const user = RequestContextService.getRequestUser();
    const currentUserCode = user?.code;

    const formDescription = found.unwrap();
    const fileImage = formDescription.getProps().file;
    const userSubmit = formDescription.getProps().submittedBy;

    // Tìm user nộp đơn để update
    const userFound: FindUserByParamsQueryResult = await this.queryBus.execute(
      new FindUserByParamsQuery({
        where: {
          code: userSubmit,
        },
      }),
    );

    if (userFound.isErr()) {
      return Err(new UserNotFoundError());
    }

    const userProps = userFound.unwrap().getProps();
    const userName = userProps.userName;
    const userId = userProps.id;

    if (
      command.status === 'APPROVED' &&
      formDescription.getProps().formId === BigInt(5) &&
      fileImage
    ) {
      const fileUrl = new URL(fileImage);
      const objectName = fileUrl.pathname.replace(/^\/faceattendance\//, '');
      const newObjectName = `face/${userName}.jpg`;

      await this.minioService.copy({
        sourceObjectName: objectName,
        targetObjectName: newObjectName,
      });

      const publicUrl = `${this.minioService.getPublicEndpoint()}/${this.minioService['_bucketName']}/${newObjectName}?v=${Date.now()}`;

      await this.commandBus.execute(
        new UpdateUserCommand({
          userId: userId,
          faceImg: publicUrl,
          updatedBy: 'system',
        }),
      );
    }

    const updatedResult = formDescription.update({
      ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
      approvedBy: currentUserCode,
      approvedTime: new Date(),
    });

    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedFormDescription =
        await this.formDescriptionRepo.update(formDescription);
      return Ok(updatedFormDescription);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormDescriptionAlreadyExistsError());
      }
      throw error;
    }
  }
}
