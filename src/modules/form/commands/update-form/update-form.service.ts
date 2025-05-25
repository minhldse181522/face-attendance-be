import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormRepositoryPort } from '../../database/form.repository.port';
import { FormEntity } from '../../domain/form.entity';
import {
  FormAlreadyExistsError,
  FormAlreadyInUseError,
  FormNotFoundError,
} from '../../domain/form.error';
import { FORM_REPOSITORY } from '../../form.di-tokens';
import { UpdateFormCommand } from './update-form.command';

export type UpdateFormServiceResult = Result<
  FormEntity,
  FormNotFoundError | FormAlreadyExistsError | FormAlreadyInUseError
>;

@CommandHandler(UpdateFormCommand)
export class UpdateFormService implements ICommandHandler<UpdateFormCommand> {
  constructor(
    @Inject(FORM_REPOSITORY)
    private readonly formRepo: FormRepositoryPort,
  ) {}

  async execute(command: UpdateFormCommand): Promise<UpdateFormServiceResult> {
    const found = await this.formRepo.findOneById(command.formId);
    if (found.isNone()) {
      return Err(new FormNotFoundError());
    }

    const form = found.unwrap();
    const updatedResult = form.update({
      ...command.getExtendedProps<UpdateFormCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedForm = await this.formRepo.update(form);
      return Ok(updatedForm);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormAlreadyExistsError());
      }
      throw error;
    }
  }
}
