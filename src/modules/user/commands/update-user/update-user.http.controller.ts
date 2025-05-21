import { Body, Controller, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import { UserResponseDto } from '../../dtos/user.response.dto';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { routesV1 } from '@src/configs/app.routes';
import { UpdateUserRequestDto } from './update-user.request.dto';
import { UpdateUserCommand } from './update-user.command';

@Controller(routesV1.version)
export class UpdateUserHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags('Users - User Management')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by ID',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand(id, dto);
    return this.commandBus.execute(command);
  }
}
