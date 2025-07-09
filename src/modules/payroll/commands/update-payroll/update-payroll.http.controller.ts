import { ApiErrorResponse } from '@libs/api/api-error.response';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  NotFoundException as NotFoundHttpException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { routesV1 } from '@src/configs/app.routes';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { match } from 'oxide.ts';
import { PayrollEntity } from '../../domain/payroll.entity';
import {
  PayrollAlreadyExistsError,
  PayrollAlreadyInUseError,
  PayrollNotFoundError,
} from '../../domain/payroll.error';
import { PayrollResponseDto } from '../../dtos/payroll.response.dto';
import { PayrollMapper } from '../../mappers/payroll.mapper';
import { UpdatePayrollCommand } from './update-payroll.command';
import { UpdatePayrollRequestDto } from './update-payroll.request.dto';
import { UpdatePayrollServiceResult } from './update-payroll.service';

@Controller(routesV1.version)
export class UpdatePayrollHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: PayrollMapper,
  ) {}

  @ApiTags(`${resourcesV1.PAYROLL.parent} - ${resourcesV1.PAYROLL.displayName}`)
  @ApiOperation({ summary: 'Update a Payroll' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Payroll ID',
    type: 'string',
    required: true,
    example: '1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PayrollResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: PayrollNotFoundError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.PAYROLL.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.tacVu.payroll.update)
  async update(
    @ReqUser() user: RequestUser,
    @Param('id') payrollId: bigint,
    @Body() body: UpdatePayrollRequestDto,
  ): Promise<PayrollResponseDto> {
    const command = new UpdatePayrollCommand({
      payrollId,
      ...body,
      updatedBy: user.userName,
    });

    const result: UpdatePayrollServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (Payroll: PayrollEntity) => this.mapper.toResponse(Payroll),
      Err: (error: Error) => {
        if (error instanceof PayrollNotFoundError) {
          throw new NotFoundHttpException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof PayrollAlreadyExistsError) {
          throw new ConflictException({
            message: error.message,
            errorCode: error.code,
          });
        }
        if (error instanceof PayrollAlreadyInUseError) {
          throw new ConflictException({
            message: error.message,
            error: error.code,
          });
        }

        throw error;
      },
    });
  }
}
