import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { TimeKeepingAlreadyInUseError } from './time-keeping.error';
import {
  CreateTimeKeepingProps,
  TimeKeepingProps,
  UpdateTimeKeepingProps,
} from './time-keeping.type';

export class TimeKeepingEntity extends AggregateRoot<TimeKeepingProps, bigint> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateTimeKeepingProps): TimeKeepingEntity {
    return new TimeKeepingEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateTimeKeepingProps,
  ): Result<unknown, TimeKeepingAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new TimeKeepingAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, TimeKeepingAlreadyInUseError> {
    if (this.props.inUseCount) return Err(new TimeKeepingAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
