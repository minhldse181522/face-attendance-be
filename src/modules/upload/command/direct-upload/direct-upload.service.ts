import { ExceptionBase } from '@libs/exceptions';
import { MinioService } from '@libs/minio/minio.service';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UpdateUserCommand } from '@src/modules/user/commands/update-user/update-user.command';
import { UserNotFoundError } from '@src/modules/user/domain/user.error';
import {
  FindUserByParamsQuery,
  FindUserByParamsQueryResult,
} from '@src/modules/user/queries/find-user-by-params/find-user-by-params.query-handler';
import { Err, Ok, Result } from 'oxide.ts';
import { DirectUploadCommand } from './direct-upload.command';

export type DirectUploadResult = Result<void, ExceptionBase>;

@CommandHandler(DirectUploadCommand)
export class DirectUploadService
  implements ICommandHandler<DirectUploadCommand>
{
  constructor(
    private readonly minIoService: MinioService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: DirectUploadCommand): Promise<DirectUploadResult> {
    try {
      const { key, file, userCode } =
        command.getExtendedProps<DirectUploadCommand>();

      // upload ảnh
      await this.minIoService.putObject(key, file.buffer, file.size, {
        'content-type': file.mimetype,
      });
      const url = `${this.minIoService.getPublicEndpoint()}/${this.minIoService['_bucketName']}/${key}`;
      console.log(url);

      // lưu vào user
      const foundUser: FindUserByParamsQueryResult =
        await this.queryBus.execute(
          new FindUserByParamsQuery({
            where: {
              code: userCode,
            },
          }),
        );
      if (foundUser.isErr()) {
        return Err(new UserNotFoundError());
      }
      const userProps = foundUser.unwrap().getProps();
      const updatedUser = await this.commandBus.execute(
        new UpdateUserCommand({
          userId: userProps.id,
          faceImg: url,
          updatedBy: userProps.updatedBy ?? 'ADMIN',
        }),
      );
      console.log(updatedUser);

      return Ok(updatedUser);
    } catch (error: any) {
      return Err(error);
    }
  }
}
