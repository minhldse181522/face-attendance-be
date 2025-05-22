import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import {
  CreatePositionProps,
  PositionProps,
  UpdatePositionProps,
} from './position.type';
import { PositionAlreadyInUseError } from './position.error';

export class PositionEntity extends AggregateRoot<PositionProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreatePositionProps): PositionEntity {
    return new PositionEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdatePositionProps,
  ): Result<unknown, PositionAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new PositionAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, PositionAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new PositionAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
