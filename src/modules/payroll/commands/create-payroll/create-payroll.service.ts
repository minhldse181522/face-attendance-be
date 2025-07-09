import { ConflictException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateCode } from '@src/libs/utils/generate-code.util';
import { Err, Ok, Result } from 'oxide.ts';
import { PayrollRepositoryPort } from '../../database/payroll.repository.port';
import { PayrollEntity } from '../../domain/payroll.entity';
import { PayrollAlreadyExistsError } from '../../domain/payroll.error';
import { PAYROLL_REPOSITORY } from '../../payroll.di-tokens';
import { CreatePayrollCommand } from './create-payroll.command';

export type CreatePayrollServiceResult = Result<
  PayrollEntity,
  PayrollAlreadyExistsError
>;

@CommandHandler(CreatePayrollCommand)
export class CreatePayrollService
  implements ICommandHandler<CreatePayrollCommand>
{
  constructor(
    @Inject(PAYROLL_REPOSITORY)
    protected readonly payrollRepo: PayrollRepositoryPort,
    protected readonly generateCode: GenerateCode,
  ) {}

  async execute(
    command: CreatePayrollCommand,
  ): Promise<CreatePayrollServiceResult> {
    const code = await this.generateCode.generateCode('PAYROLL', 4);
    const Payroll = PayrollEntity.create({
      code: code,
      ...command.getExtendedProps<CreatePayrollCommand>(),
    });

    try {
      const createdPayroll = await this.payrollRepo.insert(Payroll);
      return Ok(createdPayroll);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new PayrollAlreadyExistsError());
      }

      throw error;
    }
  }
}
