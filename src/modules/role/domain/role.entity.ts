import { AggregateID, AggregateRoot } from '@libs/ddd';
import { RoleProps } from './role.type';

export class RoleEntity extends AggregateRoot<RoleProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  validate(): void {
    // Entity business rules validation
  }
}
