import { AggregateID, AggregateRoot } from '@libs/ddd';
import { copyNonUndefinedProps } from '@libs/utils';
import {
  CreateImageStorageProps,
  ImageStorageProps,
  UpdateImageStorageProps,
} from './image-storage.type';
import { JsonValue } from '@prisma/client/runtime/library';

export class ImageStorageEntity extends AggregateRoot<
  ImageStorageProps,
  bigint
> {
  // Define more entity methods here
  protected readonly _id: AggregateID<bigint>;

  get containerNo(): string {
    return this.props.containerNo;
  }

  get idCont(): string {
    return this.props.idCont;
  }

  get jobTask(): string {
    return this.props.jobTask;
  }

  get operationCode(): string {
    return this.props.operationCode;
  }

  get jobDate(): Date {
    return this.props.jobDate;
  }

  get jobType(): string {
    return this.props.jobType;
  }

  get detail(): JsonValue {
    return this.props.detail;
  }

  static create(props: CreateImageStorageProps): ImageStorageEntity {
    return new ImageStorageEntity({
      id: BigInt(0),
      props,
    });
  }

  async update(props: UpdateImageStorageProps): Promise<void> {
    copyNonUndefinedProps(this.props, props);
  }

  async delete(): Promise<void> {
    // Entity business rules validation
  }

  validate(): void {
    // Entity business rules validation
  }
}
