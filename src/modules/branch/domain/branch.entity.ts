import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { BranchAlreadyInUseError } from './branch.error';
import {
  BranchProps,
  CreateBranchProps,
  UpdateBranchProps,
} from './branch.type';

export class BranchEntity extends AggregateRoot<BranchProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateBranchProps): BranchEntity {
    return new BranchEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdateBranchProps): Result<unknown, BranchAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new BranchAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, BranchAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new BranchAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
