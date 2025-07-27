import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  Body,
  Controller,
  HttpStatus,
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
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { PayrollEntity } from '@src/modules/payroll/domain/payroll.entity';
import { PayrollMapper } from '@src/modules/payroll/mappers/payroll.mapper';
import { match } from 'oxide.ts';
import { BangLuongResponseDto } from '../../dtos/bang-luong.response.dto';
import { ThanhToanLuongCommand } from './thanh-toan-luong.command';
import { ThanhToanLuongRequestDto } from './thanh-toan-luong.request.dto';
import { ThanhToanLuongServiceResult } from './thanh-toan-luong.service';

@Controller(routesV1.version)
export class ThanhToanLuongHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: PayrollMapper,
  ) {}

  @ApiTags(
    `${resourcesV1.BS_BANG_LUONG.parent} - ${resourcesV1.BS_BANG_LUONG.displayName}`,
  )
  @ApiOperation({ summary: 'Thanh toán lương' })
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
    type: BangLuongResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BS_BANG_LUONG.name, resourceScopes.UPDATE)
  @UseGuards(JwtAuthGuard)
  @Put(routesV1.businessLogic.bangLuong.thanhToanLuong)
  async thanhToanLuong(
    @ReqUser() user: RequestUser,
    @Param('id') payrollId: bigint,
    @Body() body: ThanhToanLuongRequestDto,
  ): Promise<BangLuongResponseDto> {
    const command = new ThanhToanLuongCommand({
      payrollId,
      ...body,
      updatedBy: user.userName,
    });

    const result: ThanhToanLuongServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (payroll: PayrollEntity) => this.mapper.toResponse(payroll),
      Err: (error: Error) => {
        throw error;
      },
    });
  }
}
