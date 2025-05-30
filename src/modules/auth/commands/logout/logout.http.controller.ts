import { routesV1 } from '@config/app.routes';
import {
  Controller,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { resourcesV1 } from '@src/configs/app.permission';
import { ApiErrorResponse } from '@src/libs/api/api-error.response';
import { RequestUser } from '../../domain/value-objects/request-user.value-objects';
import { LogoutCommand } from './logout.command';
import { JwtAuthGuard } from '../../guards/auth.guard';

@Controller(routesV1.version)
export class LogoutHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.AUTH.parent} - ${resourcesV1.AUTH.displayName}`)
  @ApiOperation({
    summary: 'Logout user and invalidate refresh token',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing token',
    type: ApiErrorResponse,
  })
  @Post(routesV1.auth.logout)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: RequestUser): Promise<void> {
    const userName = request.userName;
    if (!userName) {
      throw new UnauthorizedException('User not authenticated');
    }

    const command = new LogoutCommand({ userName });
    await this.commandBus.execute(command);
  }
}
