import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { ShiftAlreadyInUseError } from './shift.error';
import { CreateShiftProps, ShiftProps, UpdateShiftProps } from './shift.type';

export class ShiftEntity extends AggregateRoot<ShiftProps, bigint> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateShiftProps): ShiftEntity {
    return new ShiftEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdateShiftProps): Result<unknown, ShiftAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new ShiftAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, ShiftAlreadyInUseError> {
    if (this.props.inUseCount) return Err(new ShiftAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
