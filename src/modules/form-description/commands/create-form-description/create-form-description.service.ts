import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { FormRepositoryPort } from '@src/modules/form/database/form.repository.port';
import { FORM_REPOSITORY } from '@src/modules/form/form.di-tokens';
import { Err, Ok, Result } from 'oxide.ts';
import { FormDescriptionRepositoryPort } from '../../database/form-description.repository.port';
import { FormDescriptionEntity } from '../../domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionInvalidStatusError,
  FormNotFoundError,
} from '../../domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '../../form-description.di-tokens';
import { CreateFormDescriptionCommand } from './create-form-description.command';

export enum FormDescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type CreateFormDescriptionCommandResult = Result<
  FormDescriptionEntity,
  | FormDescriptionAlreadyExistsError
  | FormDescriptionInvalidStatusError
  | FormNotFoundError
>;

@CommandHandler(CreateFormDescriptionCommand)
export class CreateFormDescriptionService
  implements ICommandHandler<CreateFormDescriptionCommand>
{
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    private readonly repository: FormDescriptionRepositoryPort,
    @Inject(FORM_REPOSITORY)
    private readonly formRepository: FormRepositoryPort,
    private readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreateFormDescriptionCommand,
  ): Promise<CreateFormDescriptionCommandResult> {
    const formDescription =
      command.getExtendedProps<CreateFormDescriptionCommand>();
    const code = await this.generateCode.generateCode('FORMDES', 4);

    // Validate status if it exists
    if (
      formDescription.status &&
      !Object.values(FormDescriptionStatus).includes(
        formDescription.status as FormDescriptionStatus,
      )
    ) {
      return Err(
        new FormDescriptionInvalidStatusError(undefined, {
          providedStatus: formDescription.status,
        }),
      );
    }

    // Check if the referenced formId exists
    const formId = BigInt(formDescription.formId);
    const formExists = await this.formRepository.checkExist(formId);

    if (!formExists) {
      return Err(
        new FormNotFoundError(undefined, {
          formId: formDescription.formId,
        }),
      );
    }

    // Provide default values for optional properties
    const newFormDescription = FormDescriptionEntity.create({
      ...formDescription,
      code: code,
      formId: formId,
      submittedBy: formDescription.submittedBy,
      status: formDescription.status || FormDescriptionStatus.PENDING,
    });
    try {
      const createdForm = await this.repository.insert(newFormDescription);
      return Ok(createdForm);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new FormDescriptionAlreadyExistsError());
      }

      throw error;
    }
  }
}
