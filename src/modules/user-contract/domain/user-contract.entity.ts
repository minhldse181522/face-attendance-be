import { AggregateID, AggregateRoot } from '@libs/ddd';
import {
  CreateUserContractProps,
  UpdateUserContractProps,
  UserContractProps,
} from './user-contract.type';
import { Err, Ok, Result } from 'oxide.ts';
import { UserContractAlreadyInUseError } from './user-contract.error';
import { copyNonUndefinedProps } from '@src/libs/utils';

export class UserContractEntity extends AggregateRoot<
  UserContractProps,
  bigint
> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateUserContractProps): UserContractEntity {
    return new UserContractEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateUserContractProps,
  ): Result<unknown, UserContractAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new UserContractAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, UserContractAlreadyInUseError> {
    if (this.props.inUseCount) return Err(new UserContractAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
