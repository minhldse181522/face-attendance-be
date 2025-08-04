import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';
import { MarkAllReadCommand } from './mark-all-read.command';

export type MarkAllReadServiceResult = Result<number, void>;

@CommandHandler(MarkAllReadCommand)
export class MarkAllReadService implements ICommandHandler<MarkAllReadCommand> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    protected readonly notificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    command: MarkAllReadCommand,
  ): Promise<MarkAllReadServiceResult> {
    const count = await this.notificationRepo.markAllAsReadByUserCode(
      command.userCode,
      command.updatedBy,
    );

    return Ok(count);
  }
}
