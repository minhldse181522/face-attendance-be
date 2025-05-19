import { AggregateID, AggregateRoot } from '@libs/ddd';
import { RegisterUserProps, UserProps } from './user.type';

export class UserEntity extends AggregateRoot<UserProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: RegisterUserProps): UserEntity {
    return new UserEntity({
      id: BigInt(0),
      props,
    });
  }

  validate(): void {
    // Entity business rules validation
  }
}
