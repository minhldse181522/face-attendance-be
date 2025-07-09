import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { ReqUser } from '@libs/decorators/request-user.decorator';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { PayrollEntity } from '../../domain/payroll.entity';
import { PayrollAlreadyExistsError } from '../../domain/payroll.error';
import { PayrollResponseDto } from '../../dtos/payroll.response.dto';
import { CreatePayrollCommand } from './create-payroll.command';
import { CreatePayrollRequestDto } from './create-payroll.request.dto';
import { CreatePayrollServiceResult } from './create-payroll.service';
import { PayrollMapper } from '../../mappers/payroll.mapper';

@Controller(routesV1.version)
export class CreatePayrollHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: PayrollMapper,
  ) {}

  @ApiTags(`${resourcesV1.PAYROLL.parent} - ${resourcesV1.PAYROLL.displayName}`)
  @ApiOperation({ summary: 'Create a Payroll' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PayrollResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: PayrollAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.PAYROLL.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.payroll.root)
  async create(
    @ReqUser() user: RequestUser,
    @Body() body: CreatePayrollRequestDto,
  ): Promise<PayrollResponseDto> {
    const command = new CreatePayrollCommand({
      ...body,
      createdBy: user.userName,
    });

    const result: CreatePayrollServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Payroll: PayrollEntity) => this.mapper.toResponse(Payroll),
      Err: (error: Error) => {
        if (error instanceof PayrollAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        throw error;
      },
    });
  }
}
