import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { FormRepositoryPort } from '@src/modules/form/database/form.repository.port';
import { FORM_REPOSITORY } from '@src/modules/form/form.di-tokens';
import { Err, Ok, Result } from 'oxide.ts';

import { FormDescriptionRepositoryPort } from '@src/modules/form-description/database/form-description.repository.port';
import { FormDescriptionEntity } from '@src/modules/form-description/domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionInvalidStatusError,
} from '@src/modules/form-description/domain/form-description.error';
import { FORM_DESCRIPTION_REPOSITORY } from '@src/modules/form-description/form-description.di-tokens';
import { FormNotFoundError } from '@src/modules/form/domain/form.error';
import { UserNotFoundError } from '@src/modules/user/domain/user.error';
import { TaoDonCommand } from './tao-don.command';
import {
  FindFormDescriptionByParamsQuery,
  FindFormDescriptionByParamsQueryResult,
} from '@src/modules/form-description/queries/find-form-description-by-params/find-form-description-by-params.query-handler';

export enum FormDescriptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type TaoDonCommandResult = Result<
  FormDescriptionEntity,
  | FormDescriptionAlreadyExistsError
  | FormDescriptionInvalidStatusError
  | FormNotFoundError
  | UserNotFoundError
>;

@CommandHandler(TaoDonCommand)
export class TaoDonService implements ICommandHandler<TaoDonCommand> {
  constructor(
    @Inject(FORM_DESCRIPTION_REPOSITORY)
    private readonly repository: FormDescriptionRepositoryPort,
    @Inject(FORM_REPOSITORY)
    private readonly formRepository: FormRepositoryPort,
    private readonly generateCode: GenerateCode,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: TaoDonCommand): Promise<TaoDonCommandResult> {
    const formDescription = command.getExtendedProps<TaoDonCommand>();

    // if (
    //   formDescription.status &&
    //   formDescription.submittedBy &&
    //   formDescription.formId
    // ) {
    //   const formDescriptionFound: FindFormDescriptionByParamsQueryResult =
    //     await this.queryBus.execute(
    //       new FindFormDescriptionByParamsQuery({
    //         where: {
    //           formId: BigInt(formDescription.formId),
    //           status: 'PENDING',
    //           submittedBy: formDescription.submittedBy,
    //         },
    //       }),
    //     );
    //   if (formDescriptionFound.isOk()) {
    //     return Err(new FormDescriptionInvalidStatusError());
    //   }
    // }

    // if (
    //   formDescription.status &&
    //   !Object.values(FormDescriptionStatus).includes(
    //     formDescription.status as FormDescriptionStatus,
    //   )
    // ) {
    //   // Validate status if it exists
    //   return Err(
    //     new FormDescriptionInvalidStatusError(undefined, {
    //       providedStatus: formDescription.status,
    //     }),
    //   );
    // }

    let code: string;
    let retryCount = 0;

    do {
      code = await this.generateCode.generateCode('FORMDES', 4);
      const isExisted = await this.repository.existsByCode(code);
      if (!isExisted) break;

      retryCount++;
      if (retryCount > 5) {
        throw new ConflictException(
          'Cannot generate unique code after 5 attempts',
        );
      }
    } while (true);

    // Check if the referenced formId exists
    const formId = BigInt(formDescription.formId);
    const formExists = await this.formRepository.checkExist(formId);

    if (!formExists) {
      return Err(new FormNotFoundError());
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
