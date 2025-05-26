import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import { FormDescriptionNotFoundError } from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { DeleteFormDescriptionCommand } from './delete-form-description.command';

export type DeleteFormDescriptionServiceResult = Result<
  boolean,
  FormDescriptionNotFoundError
>;

@CommandHandler(DeleteFormDescriptionCommand)
export class DeleteFormDescriptionService
  implements ICommandHandler<DeleteFormDescriptionCommand>
{
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    protected readonly formDescriptionRepo: FormDescriptionRepositoryPort,
  ) {}

  async execute(
    command: DeleteFormDescriptionCommand,
  ): Promise<DeleteFormDescriptionServiceResult> {
    try {
      const result = await this.formDescriptionRepo.delete({
        id: command.formDescriptionId,
      } as FormDescriptionEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new FormDescriptionNotFoundError(error));
      }

      throw error;
    }
  }
}
