import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionNotFoundError,
  FormDescriptionUpdateNotAllowedError,
} from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { UpdateFormDescriptionCommand } from './update-form-description.command';

export type UpdateFormDescriptionServiceResult = Result<
  FormDescriptionEntity,
  | FormDescriptionNotFoundError
  | FormDescriptionAlreadyExistsError
  | FormDescriptionUpdateNotAllowedError
>;

@CommandHandler(UpdateFormDescriptionCommand)
export class UpdateFormDescriptionService
  implements ICommandHandler<UpdateFormDescriptionCommand>
{
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    private readonly formDescriptionRepo: FormDescriptionRepositoryPort,
  ) {}

  async execute(
    command: UpdateFormDescriptionCommand,
  ): Promise<UpdateFormDescriptionServiceResult> {
    const found = await this.formDescriptionRepo.findOneById(
      command.formDescriptionId,
    );
    if (found.isNone()) {
      return Err(new FormDescriptionNotFoundError());
    }

    const formDescription = found.unwrap();
    const updatedResult = formDescription.update({
      ...command.getExtendedProps<UpdateFormDescriptionCommand>(),
    });

    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedFormDescription =
        await this.formDescriptionRepo.update(formDescription);
      return Ok(updatedFormDescription);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormDescriptionAlreadyExistsError());
      }
      throw error;
    }
  }
}
