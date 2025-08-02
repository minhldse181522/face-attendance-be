import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import {
  WorkingScheduleAlreadyInUseError,
  WorkingScheduleInvalidStatusForDeletionError,
} from './working-schedule.error';
import {
  CreateWorkingScheduleProps,
  UpdateWorkingScheduleProps,
  WorkingScheduleProps,
} from './working-schedule.type';

export class WorkingScheduleEntity extends AggregateRoot<
  WorkingScheduleProps,
  bigint
> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateWorkingScheduleProps): WorkingScheduleEntity {
    return new WorkingScheduleEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateWorkingScheduleProps,
  ): Result<unknown, WorkingScheduleAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new WorkingScheduleAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<
    unknown,
    | WorkingScheduleAlreadyInUseError
    | WorkingScheduleInvalidStatusForDeletionError
  > {
    if (this.props.inUseCount)
      return Err(new WorkingScheduleAlreadyInUseError());

    if (this.props.status !== 'NOTSTARTED') {
      return Err(new WorkingScheduleInvalidStatusForDeletionError());
    }

    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
