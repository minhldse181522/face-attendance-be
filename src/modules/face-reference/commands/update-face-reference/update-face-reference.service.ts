import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FaceReferenceRepositoryPort } from '../../database/reference.repository.port';
import { FaceReferenceEntity } from '../../domain/reference.entity';
import {
  FaceReferenceAlreadyExistsError,
  FaceReferenceAlreadyInUseError,
  FaceReferenceNotFoundError,
} from '../../domain/reference.error';
import { FACE_REFERENCE_REPOSITORY } from '../../face-reference.di-tokens';
import { UpdateFaceReferenceCommand } from './update-face-reference.command';

export type UpdateFaceReferenceServiceResult = Result<
  FaceReferenceEntity,
  | FaceReferenceNotFoundError
  | FaceReferenceAlreadyExistsError
  | FaceReferenceAlreadyInUseError
>;

@CommandHandler(UpdateFaceReferenceCommand)
export class UpdateFaceReferenceService
  implements ICommandHandler<UpdateFaceReferenceCommand>
{
  constructor(
    @Inject(FACE_REFERENCE_REPOSITORY)
    private readonly faceReferenceRepo: FaceReferenceRepositoryPort,
  ) {}

  async execute(
    command: UpdateFaceReferenceCommand,
  ): Promise<UpdateFaceReferenceServiceResult> {
    const found = await this.faceReferenceRepo.findOneById(
      command.faceReferenceId,
    );
    if (found.isNone()) {
      return Err(new FaceReferenceNotFoundError());
    }

    const FaceReference = found.unwrap();
    const updatedResult = FaceReference.update({
      ...command.getExtendedProps<UpdateFaceReferenceCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedFaceReference =
        await this.faceReferenceRepo.update(FaceReference);
      return Ok(updatedFaceReference);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FaceReferenceAlreadyExistsError());
      }
      throw error;
    }
  }
}
