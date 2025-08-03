import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationNotFoundError } from '../../domain/notification.error';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';
import { DeleteNotificationCommand } from './delete-notification.command';

export type DeleteNotificationServiceResult = Result<
  boolean,
  NotificationNotFoundError
>;

@CommandHandler(DeleteNotificationCommand)
export class DeleteNotificationService
  implements ICommandHandler<DeleteNotificationCommand>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    protected readonly notificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    command: DeleteNotificationCommand,
  ): Promise<DeleteNotificationServiceResult> {
    try {
      const result = await this.notificationRepo.delete({
        id: command.notificationId,
      } as NotificationEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new NotificationNotFoundError(error));
      }

      throw error;
    }
  }
}
