import { AggregateID, AggregateRoot } from '@libs/ddd';
import {
  CreateFormDescriptionProps,
  FormDescriptionProps,
  UpdateFormDescriptionProps,
} from './form-description.type';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionUpdateNotAllowedError } from './form-description.error';
import { copyNonUndefinedProps } from '@src/libs/utils';

export class FormDescriptionEntity extends AggregateRoot<
  FormDescriptionProps,
  bigint
> {
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateFormDescriptionProps): FormDescriptionEntity {
    return new FormDescriptionEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateFormDescriptionProps,
  ): Result<unknown, FormDescriptionUpdateNotAllowedError> {
    // Check if update is allowed based on status
    if (this.props.status === 'APPROVED' && props.status !== 'CANCELED') {
      return Err(new FormDescriptionUpdateNotAllowedError());
    }

    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, FormDescriptionUpdateNotAllowedError> {
    // Entity business rules validation - prevent deletion if already approved
    if (this.props.status === 'APPROVED') {
      return Err(new FormDescriptionUpdateNotAllowedError());
    }
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }

  // Add a public method to set the form title
  public setFormTitle(title: string): void {
    this.props.formTitle = title;
  }

  // Add a getter to retrieve the form title
  public getFormTitle(): string | undefined {
    return this.props.formTitle;
  }

  // Add a public method to set the submitter full name
  public setSubmitterFullName(fullName: string): void {
    this.props.submittedBy = fullName;
  }

  // Add a getter to retrieve the submitter full name
  public getSubmitterFullName(): string | undefined {
    return this.props.submittedBy;
  }
}
