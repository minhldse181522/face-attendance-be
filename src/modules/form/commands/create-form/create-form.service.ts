import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { FormRepositoryPort } from '../../database/form.repository.port';
import { FormEntity } from '../../domain/form.entity';
import { FormAlreadyExistsError } from '../../domain/form.error';
import { FORM_REPOSITORY } from '../../form.di-tokens';
import { CreateFormCommand } from './create-form.command';

export type CreateFormServiceResult = Result<
  FormEntity,
  FormAlreadyExistsError
>;

@CommandHandler(CreateFormCommand)
export class CreateFormService implements ICommandHandler<CreateFormCommand> {
  constructor(
    @Inject(FORM_REPOSITORY)
    protected readonly formRepo: FormRepositoryPort,
  ) {}

  async execute(command: CreateFormCommand): Promise<CreateFormServiceResult> {
    const form = FormEntity.create({
      ...command.getExtendedProps<CreateFormCommand>(),
    });

    try {
      const createdForm = await this.formRepo.insert(form);
      return Ok(createdForm);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormAlreadyExistsError());
      }

      throw error;
    }
  }
}
