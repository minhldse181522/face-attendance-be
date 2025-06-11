import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MinioService } from '@src/libs/minio/minio.service';
import { DeleteObjectCommand } from './delete-object.command';

@CommandHandler(DeleteObjectCommand)
export class DeleteObjectService
  implements ICommandHandler<DeleteObjectCommand>
{
  constructor(private readonly minIoService: MinioService) {}

  async execute(command: DeleteObjectCommand): Promise<void> {
    return await this.minIoService.remove(command.path);
  }
}
