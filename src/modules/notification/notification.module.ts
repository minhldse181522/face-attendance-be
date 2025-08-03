import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaNotificationRepository } from './database/notification.repository.prisma';
import { NotificationMapper } from './mappers/notification.mapper';
import { NOTIFICATION_REPOSITORY } from './notification.di-tokens';
import { FindNotificationsHttpController } from './queries/find-notifications/find-notifications.http.controller';
import { FindNotificationsQueryHandler } from './queries/find-notifications/find-notifications.query-handler';
import { CreateNotificationHttpController } from './commands/create-notification/create-notification.http.controller';
import { UpdateNotificationHttpController } from './commands/update-notification/update-notification.http.controller';
import { DeleteNotificationHttpController } from './commands/delete-notification/delete-notification.http.controller';
import { CreateNotificationService } from './commands/create-notification/create-notification.service';
import { UpdateNotificationService } from './commands/update-notification/update-notification.service';
import { DeleteNotificationService } from './commands/delete-notification/delete-notification.service';
import { MarkAllReadHttpController } from './commands/mark-all-read/mark-all-read.http.controller';
import { MarkAllReadService } from './commands/mark-all-read/mark-all-read.service';

const httpControllers = [
  FindNotificationsHttpController,
  CreateNotificationHttpController,
  UpdateNotificationHttpController,
  DeleteNotificationHttpController,
  MarkAllReadHttpController,
];

const messageControllers = [];

const cliControllers: Provider[] = [];

const graphqlResolvers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateNotificationService,
  UpdateNotificationService,
  DeleteNotificationService,
  MarkAllReadService,
];

const queryHandlers: Provider[] = [FindNotificationsQueryHandler];

const mappers: Provider[] = [NotificationMapper];

const utils: Provider[] = [];

const repositories: Provider[] = [
  {
    provide: NOTIFICATION_REPOSITORY,
    useClass: PrismaNotificationRepository,
  },
];

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
export class NotificationModule {}
