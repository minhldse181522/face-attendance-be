import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestContextService } from '@src/libs/application/context/AppRequestContext';
import {
  FindPayrollByParamsQuery,
  FindPayrollByParamsQueryResult,
} from '@src/modules/payroll/queries/find-payroll-by-params/find-payroll-by-params.query-handler';
import {
  FindManyTimeKeepingByParamsQuery,
  FindManyTimeKeepingByParamsQueryResult,
} from '@src/modules/time-keeping/queries/find-many-time-keeping-by-params/find-many-time-keeping-by-params.query-handler';
import {
  FindUserContractByParamsQuery,
  FindUserContractByParamsQueryResult,
} from '@src/modules/user-contract/queries/find-user-contract-by-params/find-user-contract-by-params.query-handler';
import { WorkingScheduleRepositoryPort } from '@src/modules/working-schedule/database/working-schedule.repository.port';
import { WORKING_SCHEDULE_REPOSITORY } from '@src/modules/working-schedule/working-schedule.di-tokens';
import { endOfMonth, startOfMonth } from 'date-fns';
import {
  FindPositionByParamsQuery,
  FindPositionByParamsQueryResult,
} from './../../../../modules/position/queries/find-position-by-params/find-postion-by-params.query-handler';
import { CreatePayrollCommand } from '@src/modules/payroll/commands/create-payroll/create-payroll.command';
import { UpdatePayrollCommand } from '@src/modules/payroll/commands/update-payroll/update-payroll.command';
import {
  FindManyFormDescriptionByParamsQuery,
  FindManyFormDescriptionByParamsQueryResult,
} from '@src/modules/form-description/queries/find-many-form-description-by-params/find-many-form-description-by-params.query-handler';

@Injectable()
export class TinhBangLuongCronService {
  private readonly logger = new Logger(TinhBangLuongCronService.name);
  constructor(
    @Inject(WORKING_SCHEDULE_REPOSITORY)
    protected readonly workingScheduleRepo: WorkingScheduleRepositoryPort,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleSalaryCron() {
    await RequestContextService.runWithContext(
      {
        tenantId: 'default',
        user: { username: 'system' },
      },
      async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear() % 100;
        const formattedMonth = `${month}/${year}`;

        const allUser = await this.workingScheduleRepo.getAllUserCodes();

        for (const userCode of allUser) {
          const workingSchedules =
            await this.workingScheduleRepo.findAllWorkingScheduleWithShift({
              userCode,
              date: {
                gte: startOfMonth(now),
                lte: endOfMonth(now),
              },
              status: {
                in: ['END', 'LATE', 'FORGET'],
              },
            });

          const actualSalaryHours = workingSchedules.reduce((sum, ws) => {
            const workingHours =
              ws.getProps().shift?.getProps().workingHours ?? 0;
            return sum + workingHours;
          }, 0);

          const workDay = workingSchedules.filter((ws) =>
            ['END', 'FORGET'].includes(ws.getProps().status || ''),
          ).length;

          const lateCount = workingSchedules.filter(
            (ws) => ws.getProps().status === 'LATE',
          ).length;

          const forgetCount = workingSchedules.filter(
            (ws) => ws.getProps().status === 'FORGET',
          ).length;

          const lateTimeCount = lateCount + forgetCount;

          // Lấy số giờ OT từ đơn đã duyệt tăng ca
          const overTimeResult: FindManyFormDescriptionByParamsQueryResult =
            await this.queryBus.execute(
              new FindManyFormDescriptionByParamsQuery({
                where: {
                  submittedBy: userCode,
                  status: 'APPROVED',
                  statusOvertime: true,
                  startTime: { gte: startOfMonth(now) },
                  endTime: { lte: endOfMonth(now) },
                },
              }),
            );
          const otForms = overTimeResult.unwrapOr([]);
          const totalOvertimeHours = otForms.reduce((sum, form) => {
            const { startTime, endTime } = form.getProps();
            const durationMs =
              new Date(endTime).getTime() - new Date(startTime).getTime();
            const hours = durationMs / (1000 * 60 * 60);
            return sum + hours;
          }, 0);

          // Lấy hợp đồng người dùng để lấy positionCode
          const userContractResult: FindUserContractByParamsQueryResult =
            await this.queryBus.execute(
              new FindUserContractByParamsQuery({
                where: {
                  userCode,
                  status: 'ACTIVE',
                  startTime: { lte: now },
                  endTime: { gte: now },
                },
              }),
            );
          if (userContractResult.isErr()) continue;
          const positionCode = userContractResult
            .unwrap()
            .getProps().positionCode;

          // Lấy lương cơ bản và phụ cấp theo role
          const positionResult: FindPositionByParamsQueryResult =
            await this.queryBus.execute(
              new FindPositionByParamsQuery({
                where: {
                  code: positionCode,
                },
              }),
            );
          if (positionResult.isErr()) continue;
          const positionProps = positionResult.unwrap().getProps();
          const salaryPerHour = positionProps.baseSalary ?? 0;
          const allowance = positionProps.allowance ?? 0;
          const lateFine = positionProps.lateFine ?? 0;
          const overtimeRate = positionProps.overtimeSalary ?? 0;
          const totalOvertimeSalary = totalOvertimeHours * overtimeRate;
          const actualSalary =
            Math.round(actualSalaryHours * salaryPerHour * 100) / 100;

          // Tính lương cuối cùng
          const totalSalary =
            Number(actualSalary) +
            allowance +
            totalOvertimeSalary -
            lateFine * lateTimeCount;

          if (isNaN(Number(actualSalary)) || isNaN(totalSalary)) {
            this.logger.warn(
              `⚠️ Skip payroll for ${userCode} due to NaN salary`,
            );
            continue;
          }

          // Kiểm tra user có bảng lương chưa
          const foundPayroll: FindPayrollByParamsQueryResult =
            await this.queryBus.execute(
              new FindPayrollByParamsQuery({
                where: {
                  userCode,
                  month: formattedMonth,
                },
              }),
            );
          if (foundPayroll.isErr()) {
            await this.commandBus.execute(
              new CreatePayrollCommand({
                userCode,
                month: formattedMonth,
                baseSalary: salaryPerHour,
                actualSalary,
                totalWorkHour: actualSalaryHours,
                status: 'NOTPAID',
                paidDate: null,
                allowance,
                overtimeSalary: totalOvertimeHours,
                workDay,
                lateFine,
                lateTimeCount,
                totalSalary,
                createdBy: 'system',
              }),
            );
          } else {
            const payroll = foundPayroll.unwrap();
            await this.commandBus.execute(
              new UpdatePayrollCommand({
                payrollId: payroll.id,
                userCode,
                month: formattedMonth,
                baseSalary: salaryPerHour,
                actualSalary,
                totalWorkHour: actualSalaryHours,
                allowance,
                overtimeSalary: totalOvertimeHours,
                workDay,
                lateFine,
                lateTimeCount,
                totalSalary,
                updatedBy: 'system',
              }),
            );
          }
        }

        this.logger.log('✅ Payroll updated successfully for all users.');
      },
    );
  }
}
