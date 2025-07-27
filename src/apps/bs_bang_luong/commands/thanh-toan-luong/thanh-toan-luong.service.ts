import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import { PayrollRepositoryPort } from '@src/modules/payroll/database/payroll.repository.port';
import { PayrollEntity } from '@src/modules/payroll/domain/payroll.entity';
import {
  PayrollAlreadyExistsError,
  PayrollAlreadyInUseError,
  PayrollNotFoundError,
} from '@src/modules/payroll/domain/payroll.error';
import { PAYROLL_REPOSITORY } from '@src/modules/payroll/payroll.di-tokens';
import { UpdateWorkingScheduleCommand } from '@src/modules/working-schedule/commands/update-working-schedule/update-working-schedule.command';
import {
  FindWorkingScheduleArrayByParamsQuery,
  FindWorkingScheduleArrayByParamsQueryResult,
} from '@src/modules/working-schedule/queries/find-working-schedule-array-by-params/find-working-schedule-array-by-params.query-handler';
import { Err, Ok, Result } from 'oxide.ts';
import { WorkingScheduleUserNotFound } from '../../domain/bang-luong.error';
import { ThanhToanLuongCommand } from './thanh-toan-luong.command';

export type ThanhToanLuongServiceResult = Result<
  PayrollEntity,
  | PayrollNotFoundError
  | PayrollAlreadyExistsError
  | PayrollAlreadyInUseError
  | WorkingScheduleUserNotFound
>;

@CommandHandler(ThanhToanLuongCommand)
export class ThanhToanLuongService
  implements ICommandHandler<ThanhToanLuongCommand>
{
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    private readonly payrollRepo: PayrollRepositoryPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: ThanhToanLuongCommand,
  ): Promise<ThanhToanLuongServiceResult> {
    const found = await this.payrollRepo.findOneById(command.payrollId);
    if (found.isNone()) {
      return Err(new PayrollNotFoundError());
    }

    const luong = found.unwrap();
    const luongProps = luong.getProps();
    const userCode = luongProps.userCode;

    // Đi tìm lịch làm của nhân viên này (để chuyển status nếu là STOP)
    const workingScheduleResults: FindWorkingScheduleArrayByParamsQueryResult =
      await this.queryBus.execute(
        new FindWorkingScheduleArrayByParamsQuery({
          userCode,
          status: 'NOTSTARTED',
        }),
      );

    if (workingScheduleResults.isErr()) {
      return Err(new WorkingScheduleUserNotFound());
    }
    const workingScheduleProps = workingScheduleResults.unwrap();

    if (command.status === 'ACCEPT') {
      await this.commandBus.execute(
        new UpdatePayrollCommand({
          payrollId: luong.id,
          status: 'ACCEPT',
          updatedBy: command.updatedBy,
        }),
      );
      return Ok(luong);
    } else if (command.status === 'STOP') {
      for (const schedule of workingScheduleProps) {
        await this.commandBus.execute(
          new UpdateWorkingScheduleCommand({
            workingScheduleId: schedule.id,
            status: 'NOTWORK',
            updatedBy: 'system',
          }),
        );
      }
      await this.commandBus.execute(
        new UpdatePayrollCommand({
          payrollId: luong.id,
          status: 'STOP',
          updatedBy: command.updatedBy,
        }),
      );
      return Ok(luong);
    }
    return Ok(luong);
  }
}
