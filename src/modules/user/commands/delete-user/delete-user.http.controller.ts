import { Controller, Delete, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/auth.guard';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { routesV1 } from '@src/configs/app.routes';
import { DeleteUserCommand } from './delete-user.command';

@Controller(routesV1.version)
export class DeleteUserHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags('Users - User Management')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ApiErrorResponse,
    description: 'User not found',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    const command = new DeleteUserCommand(id);
    await this.commandBus.execute(command);
  }
}
