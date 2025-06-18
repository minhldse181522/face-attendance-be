import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { FaceReferenceRepositoryPort } from '../../database/reference.repository.port';
import { FaceReferenceEntity } from '../../domain/reference.entity';
import { FaceReferenceAlreadyExistsError } from '../../domain/reference.error';
import { FACE_REFERENCE_REPOSITORY } from '../../face-reference.di-tokens';
import { CreateFaceReferenceCommand } from './create-face-reference.command';

export type CreateFaceReferenceServiceResult = Result<
  FaceReferenceEntity,
  FaceReferenceAlreadyExistsError
>;

@CommandHandler(CreateFaceReferenceCommand)
export class CreateFaceReferenceService
  implements ICommandHandler<CreateFaceReferenceCommand>
{
  constructor(
    @Inject(FACE_REFERENCE_REPOSITORY)
    protected readonly faceReferenceRepo: FaceReferenceRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateFaceReferenceCommand,
  ): Promise<CreateFaceReferenceServiceResult> {
    const code = await this.generateCode.generateCode('FR', 4);

    const faceReference = FaceReferenceEntity.create({
      code: code,
      ...command.getExtendedProps<CreateFaceReferenceCommand>(),
    });

    try {
      const createdFaceReference =
        await this.faceReferenceRepo.insert(faceReference);
      return Ok(createdFaceReference);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FaceReferenceAlreadyExistsError());
      }

      throw error;
    }
  }
}
