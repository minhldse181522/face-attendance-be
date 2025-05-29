import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { UserBranchAlreadyInUseError } from './user-branch.error';
import {
  UserBranchProps,
  CreateUserBranchProps,
  UpdateUserBranchProps,
} from './user-branch.type';

export class UserBranchEntity extends AggregateRoot<UserBranchProps, bigint> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateUserBranchProps): UserBranchEntity {
    return new UserBranchEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateUserBranchProps,
  ): Result<unknown, UserBranchAlreadyInUseError> {
    if (props.branchCode && this.props.code) {
      return Err(new UserBranchAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, UserBranchAlreadyInUseError> {
    if (this.props.code) return Err(new UserBranchAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
