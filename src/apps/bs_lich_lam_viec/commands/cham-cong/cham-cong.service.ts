import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { CreateTimeKeepingCommand } from '@src/modules/time-keeping/commands/create-time-keeping/create-time-keeping.command';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WorkingScheduleEntity } from '@src/modules/working-schedule/domain/working-schedule.entity';
import { WorkingScheduleNotFoundError } from '@src/modules/working-schedule/domain/working-schedule.error';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { Err, Ok, Result } from 'oxide.ts';
import {
  ChamCongKhongDuDieuKienError,
  CheckInTimeNotInContractError,
} from '../../domain/lich-lam-viec.error';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from './../../../../modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { ChamCongCommand } from './cham-cong.command';

export type ChamCongServiceResult = Result<
  WorkingScheduleEntity,
  | WorkingScheduleNotFoundError
  | ChamCongKhongDuDieuKienError
  | CheckInTimeNotInContractError
>;

@CommandHandler(ChamCongCommand)
export class UpdateChamCongService implements ICommandHandler<ChamCongCommand> {
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    protected readonly generateCode: GenerateCode,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ChamCongCommand): Promise<ChamCongServiceResult> {
    const code = await this.generateCode.generateCode('TK', 4);

    const found = await this.workingScheduleRepo.findOneById(
      command.workingScheduleId,
    );
    if (found.isNone()) {
      return Err(new WorkingScheduleNotFoundError());
    }
    const workingSchedule = found.unwrap();
    const workingScheduleProps = found.unwrap().getProps();

    // Kiểm tra thời gian checkin có nằm trong thời hạn hợp đồng
    const checkInTimeValidInContract: FindUserContractByParamsQueryResult =
      await this.queryBus.execute(
        new FindUserContractByParamsQuery({
          where: {
            AND: [
              {
                startTime: { lte: command.checkInTime },
                endTime: {
                  gte: command.checkInTime,
                },
              },
            ],
          },
        }),
      );
    if (checkInTimeValidInContract.isErr()) {
      return Err(new CheckInTimeNotInContractError());
    }
    if (workingSchedule && command.checkInTime) {
      await this.commandBus.execute(
        new UpdateWorkingScheduleCommand({
          workingScheduleId: workingScheduleProps.id,
          status: 'ACTIVE',
          updatedBy: command.updatedBy,
        }),
      );

      // insert vào bảng time keeping
      const createdTimeKeeping = await this.commandBus.execute(
        new CreateTimeKeepingCommand({
          code: code,
          checkInTime: command.checkInTime,
          checkOutTime: null,
          date: workingScheduleProps.date,
          status: 'STARTED',
          userCode: workingScheduleProps.userCode,
          workingScheduleCode: workingScheduleProps.code,
          createdBy: command.updatedBy,
        }),
      );
      return Ok(createdTimeKeeping.unwrap());
    } else {
      return Err(new ChamCongKhongDuDieuKienError());
    }
  }
}
