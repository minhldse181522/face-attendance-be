import { AggregateID, AggregateRoot } from '@libs/ddd';
import { RegisterUserProps, UpdateUserProps, UserProps } from './user.type';
import { Err, Ok, Result } from 'oxide.ts';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { UserNotFoundError } from './user.error';

export class UserEntity extends AggregateRoot<UserProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: RegisterUserProps): UserEntity {
    return new UserEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdateUserProps): Result<unknown, UserNotFoundError> {
    if (this.props.inUseCount) {
      return Err(new UserNotFoundError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
