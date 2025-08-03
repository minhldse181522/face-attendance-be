import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationRepositoryPort } from '../../database/notification.repository.port';
import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationAlreadyExistsError } from '../../domain/notification.error';
import { NOTIFICATION_REPOSITORY } from '../../notification.di-tokens';
import { CreateNotificationCommand } from './create-notification.command';

export type CreateNotificationServiceResult = Result<
  NotificationEntity,
  NotificationAlreadyExistsError
>;

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationService
  implements ICommandHandler<CreateNotificationCommand>
{
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    protected readonly NotificationRepo: NotificationRepositoryPort,
  ) {}

  async execute(
    command: CreateNotificationCommand,
  ): Promise<CreateNotificationServiceResult> {
    const Notification = NotificationEntity.create({
      ...command.getExtendedProps<CreateNotificationCommand>(),
    });

    try {
      const createdNotification =
        await this.NotificationRepo.insert(Notification);
      return Ok(createdNotification);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new NotificationAlreadyExistsError());
      }

      throw error;
    }
  }
}
