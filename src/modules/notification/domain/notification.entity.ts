import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationAlreadyInUseError } from './notification.error';
import {
  CreateNotificationProps,
  NotificationProps,
  UpdateNotificationProps,
} from './notification.type';

export class NotificationEntity extends AggregateRoot<
  NotificationProps,
  bigint
> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateNotificationProps): NotificationEntity {
    return new NotificationEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateNotificationProps,
  ): Result<unknown, NotificationAlreadyInUseError> {
    if (this.props.inUseCount) {
      return Err(new NotificationAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, NotificationAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new NotificationAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
