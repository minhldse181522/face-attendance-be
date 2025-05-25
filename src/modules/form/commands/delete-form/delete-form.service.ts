import { NotFoundException } from '@libs/exceptions';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormRepositoryPort } from '../../database/form.repository.port';
import { FormEntity } from '../../domain/form.entity';
import { FormNotFoundError } from '../../domain/form.error';
import { FORM_REPOSITORY } from '../../form.di-tokens';
import { DeleteFormCommand } from './delete-form.command';

export type DeleteFormServiceResult = Result<boolean, FormNotFoundError>;

@CommandHandler(DeleteFormCommand)
export class DeleteFormService implements ICommandHandler<DeleteFormCommand> {
  constructor(
    @Inject(FORM_REPOSITORY)
    protected readonly formRepo: FormRepositoryPort,
  ) {}

  async execute(command: DeleteFormCommand): Promise<DeleteFormServiceResult> {
    try {
      const result = await this.formRepo.delete({
        id: command.formId,
      } as FormEntity);

      return Ok(result);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        return Err(new FormNotFoundError(error));
      }

      throw error;
    }
  }
}
