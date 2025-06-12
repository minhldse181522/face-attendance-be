import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FaceReferenceRepositoryPort } from '../../database/reference.repository.port';
import { FaceReferenceEntity } from '../../domain/reference.entity';
import { FaceReferenceNotFoundError } from '../../domain/reference.error';
import { FACE_REFERENCE_REPOSITORY } from '../../face-reference.di-tokens';
import { DeleteFaceReferenceCommand } from './delete-face-reference.command';

export type DeleteFaceReferenceServiceResult = Result<
  boolean,
  FaceReferenceNotFoundError
>;

@CommandHandler(DeleteFaceReferenceCommand)
export class DeleteFaceReferenceService
  implements ICommandHandler<DeleteFaceReferenceCommand>
{
  constructor(
    @Inject(FACE_REFERENCE_REPOSITORY)
    protected readonly faceReferenceRepo: FaceReferenceRepositoryPort,
  ) {}

  async execute(
    command: DeleteFaceReferenceCommand,
  ): Promise<DeleteFaceReferenceServiceResult> {
    try {
      const result = await this.faceReferenceRepo.delete({
        id: command.faceReferenceId,
      } as FaceReferenceEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new FaceReferenceNotFoundError(error));
      }

      throw error;
    }
  }
}
