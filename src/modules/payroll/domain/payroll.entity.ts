import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { PayrollAlreadyInUseError } from './payroll.error';
import {
  CreatePayrollProps,
  PayrollProps,
  UpdatePayrollProps,
} from './payroll.type';

export class PayrollEntity extends AggregateRoot<PayrollProps, bigint> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreatePayrollProps): PayrollEntity {
    return new PayrollEntity({
      id: BigInt(0),
      props,
    });
  }

  update(props: UpdatePayrollProps): Result<unknown, PayrollAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new PayrollAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, PayrollAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new PayrollAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
