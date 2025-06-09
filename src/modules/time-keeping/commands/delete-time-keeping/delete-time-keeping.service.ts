import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingRepositoryPort } from '../../database/time-keeping.repository.port';
import { TimeKeepingEntity } from '../../domain/time-keeping.entity';
import { TimeKeepingNotFoundError } from '../../domain/time-keeping.error';
import { TIME_KEEPING_REPOSITORY } from '../../time-keeping.di-tokens';
import { DeleteTimeKeepingCommand } from './delete-time-keeping.command';

export type DeleteTimeKeepingServiceResult = Result<
  boolean,
  TimeKeepingNotFoundError
>;

@CommandHandler(DeleteTimeKeepingCommand)
export class DeleteTimeKeepingService
  implements ICommandHandler<DeleteTimeKeepingCommand>
{
  constructor(
    @Inject(TIME_KEEPING_REPOSITORY)
    protected readonly timeKeepingRepo: TimeKeepingRepositoryPort,
  ) {}

  async execute(
    command: DeleteTimeKeepingCommand,
  ): Promise<DeleteTimeKeepingServiceResult> {
    try {
      const result = await this.timeKeepingRepo.delete({
        id: command.timeKeepingId,
      } as TimeKeepingEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new TimeKeepingNotFoundError(error));
      }

      throw error;
    }
  }
}
