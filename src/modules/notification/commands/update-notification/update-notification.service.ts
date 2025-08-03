import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NotificationEntity } from '../../domain/notification.entity';
import {
  NotificationAlreadyExistsError,
  NotificationAlreadyInUseError,
  NotificationNotFoundError,
} from '../../domain/notification.error';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';
import { UpdateNotificationCommand } from './update-notification.command';

export type UpdateNotificationServiceResult = Result<
  NotificationEntity,
  | NotificationNotFoundError
  | NotificationAlreadyExistsError
  | NotificationAlreadyInUseError
>;

@CommandHandler(UpdateNotificationCommand)
export class UpdateNotificationService
  implements ICommandHandler<UpdateNotificationCommand>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    command: UpdateNotificationCommand,
  ): Promise<UpdateNotificationServiceResult> {
    const found = await this.notificationRepo.findOneById(
      command.notificationId,
    );
    if (found.isNone()) {
      return Err(new NotificationNotFoundError());
    }

    const Notification = found.unwrap();
    const updatedResult = Notification.update({
      ...command.getExtendedProps<UpdateNotificationCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedNotification =
        await this.notificationRepo.update(Notification);
      return Ok(updatedNotification);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new NotificationAlreadyExistsError());
      }
      throw error;
    }
  }
}
