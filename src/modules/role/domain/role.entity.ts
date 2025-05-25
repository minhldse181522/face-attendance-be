import { AggregateID, AggregateRoot } from '@libs/ddd';
import { CreateRoleProps, RoleProps, UpdateRoleProps } from './role.type';
import { Err, Ok, Result } from 'oxide.ts';
import { RoleAlreadyInUseError } from './role.error';
import { copyNonUndefinedProps } from '@src/libs/utils';

export class RoleEntity extends AggregateRoot<RoleProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateRoleProps): RoleEntity {
    return new RoleEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdateRoleProps): Result<unknown, RoleAlreadyInUseError> {
    if (
      props.roleCode &&
      this.props.roleCode !== props.roleCode &&
      this.props.inUseCount
    ) {
      return Err(new RoleAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, RoleAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new RoleAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
