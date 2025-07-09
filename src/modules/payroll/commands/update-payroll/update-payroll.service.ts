import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { PayrollRepositoryPort } from '../../database/payroll.repository.port';
import { PayrollEntity } from '../../domain/payroll.entity';
import {
  PayrollAlreadyExistsError,
  PayrollAlreadyInUseError,
  PayrollNotFoundError,
} from '../../domain/payroll.error';
import { PAYROLL_REPOSITORY } from '../../payroll.di-tokens';
import { UpdatePayrollCommand } from './update-payroll.command';

export type UpdatePayrollServiceResult = Result<
  PayrollEntity,
  PayrollNotFoundError | PayrollAlreadyExistsError | PayrollAlreadyInUseError
>;

@CommandHandler(UpdatePayrollCommand)
export class UpdatePayrollService
  implements ICommandHandler<UpdatePayrollCommand>
{
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    private readonly PayrollRepo: PayrollRepositoryPort,
  ) {}

  async execute(
    command: UpdatePayrollCommand,
  ): Promise<UpdatePayrollServiceResult> {
    const found = await this.PayrollRepo.findOneById(command.payrollId);
    if (found.isNone()) {
      return Err(new PayrollNotFoundError());
    }

    const Payroll = found.unwrap();
    const updatedResult = Payroll.update({
      ...command.getExtendedProps<UpdatePayrollCommand>(),
    });
    if (updatedResult.isErr()) {
      return updatedResult;
    }

    try {
      const updatedPayroll = await this.PayrollRepo.update(Payroll);
      return Ok(updatedPayroll);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new PayrollAlreadyExistsError());
      }
      throw error;
    }
  }
}
