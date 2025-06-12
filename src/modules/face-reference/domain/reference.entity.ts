import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@src/libs/utils';
import { Err, Ok, Result } from 'oxide.ts';
import { FaceReferenceAlreadyInUseError } from './reference.error';
import {
  CreateFaceReferenceProps,
  FaceReferenceProps,
  UpdateFaceReferenceProps,
} from './reference.type';

export class FaceReferenceEntity extends AggregateRoot<
  FaceReferenceProps,
  bigint
> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  static create(props: CreateFaceReferenceProps): FaceReferenceEntity {
    return new FaceReferenceEntity({
      id: BigInt(0),
      props,
    });
  }

  update(
    props: UpdateFaceReferenceProps,
  ): Result<unknown, FaceReferenceAlreadyInUseError> {
    if (props.code && this.props.code !== props.code && this.props.inUseCount) {
      return Err(new FaceReferenceAlreadyInUseError());
    }
    copyNonUndefinedProps(this.props, props);
    return Ok(true);
  }

  delete(): Result<unknown, FaceReferenceAlreadyInUseError> {
    // Entity business rules validation
    if (this.props.inUseCount) return Err(new FaceReferenceAlreadyInUseError());
    return Ok(true);
  }

  validate(): void {
    // Entity business rules validation
  }
}
