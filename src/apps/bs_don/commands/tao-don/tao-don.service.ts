import { ConflictException, Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { CreateNotificationCommand } from '@src/modules/notification/commands/create-notification/create-notification.command';
import { WebsocketService } from '@src/libs/websocket/websocket.service';
import { UserContractRepositoryPort } from '@src/apps/bs-user-contract/database/user-contract.repository.port';
import { BS_USER_CONTRACT_REPOSITORY } from '@src/apps/bs-user-contract/user-contract.di-tokens';

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
    @Inject(BS_USER_CONTRACT_REPOSITORY)
    private readonly userContractRepository: UserContractRepositoryPort,
    private readonly generateCode: GenerateCode,
    private readonly commandBus: CommandBus,
    private readonly websocketService: WebsocketService,
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

    // Check if the referenced formId exists
    const formId = BigInt(formDescription.formId);
    const formExists = await this.formRepository.checkExist(formId);

    if (!formExists) {
      return Err(new FormNotFoundError());
    }

    let code: string;
    let retryCount = 0;
    const maxRetries = 10;

    do {
      code = await this.generateCode.generateCode('FORMDES', 4);
      const isExisted = await this.repository.existsByCode(code);
      if (!isExisted) break;

      retryCount++;
      if (retryCount > maxRetries) {
        throw new ConflictException(
          `Cannot generate unique code after ${maxRetries} attempts`,
        );
      }
    } while (true);

    // Provide default values for optional properties
    const newFormDescription = FormDescriptionEntity.create({
      ...formDescription,
      code: code,
      formId: formId,
      submittedBy: formDescription.submittedBy,
      status: formDescription.status || FormDescriptionStatus.PENDING,
    });

    // Tìm người quản lý của user đã submit đơn
    let managerUserCode: string | null = null;
    try {
      const userContract = await this.userContractRepository.findByUserCode(formDescription.submittedBy);
      const managerProps = userContract.getProps().manager;
      managerUserCode = managerProps ? managerProps.getProps().code : null;
    } catch (error) {
      // Nếu không tìm thấy contract hoặc manager, sẽ gửi notification cho chính user đó
      managerUserCode = formDescription.submittedBy;
    }

    // Đảm bảo có userCode để gửi notification
    const targetUserCode = managerUserCode || "";

    // Tạo ra Notification
    const result = await this.commandBus.execute(
      new CreateNotificationCommand({
        title: "Thông báo mới!!!",
        message: formDescription.reason,
        type: 'SUCCESS',
        isRead: false,
        userCode: targetUserCode,
        createdBy: 'system',
      }),
    );
    if (result.isErr()) {
      throw result.unwrapErr();
    }

    // Lấy NotificationEntity
    const createdNotification = result.unwrap();

    // Lấy plain object để gửi socket
    const { isRead, ...notificationPayload } =
      createdNotification.getProps();

    const safePayload = JSON.parse(
      JSON.stringify(notificationPayload, (_, val) =>
        typeof val === 'bigint' ? val.toString() : val,
      ),
    );

    await this.websocketService.publish({
      event: `NOTIFICATION_CREATED_${targetUserCode}`,
      data: safePayload,
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
