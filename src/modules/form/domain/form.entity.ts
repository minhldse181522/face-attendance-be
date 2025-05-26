import { AggregateID, AggregateRoot } from '@libs/ddd';
import { CreateFormProps, FormProps, UpdateFormProps } from './form.type';
import { Err, Ok, Result } from 'oxide.ts';
import { FormAlreadyInUseError } from './form.error';
import { copyNonUndefinedProps } from '@src/libs/utils';

export class FormEntity extends AggregateRoot<FormProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateFormProps): FormEntity {
    return new FormEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdateFormProps): Result<unknown, FormAlreadyInUseError> {
    if (this.props.inUseCount) {
      return Err(new FormAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, FormAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new FormAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
