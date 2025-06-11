import { Err, Ok, Result } from 'oxide.ts';
import { ExceptionBase } from '@libs/exceptions';
import { MinioService } from '@libs/minio/minio.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DownloadCommand } from './download.command';

export type DownloadResult = Result<
  { filename: string; contentType: string; size: number; buffer: Buffer },
  ExceptionBase
>;

@CommandHandler(DownloadCommand)
export class DownloadService implements ICommandHandler<DownloadCommand> {
  constructor(private readonly minIoService: MinioService) {}

  async execute(command: DownloadCommand): Promise<DownloadResult> {
    try {
      const { path: key } = command.getExtendedProps<DownloadCommand>();

      const fileInfo = await this.minIoService.getInfoObject(key);

      return Ok({
        filename: key.split('/').pop() ?? 'download',
        contentType: fileInfo.metaData['content-type'],
        size: fileInfo.size,
        buffer: await this.minIoService.getObject(key),
      });
    } catch (error: any) {
      return Err(error);
    }
  }
}
