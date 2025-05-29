import { routesV1 } from '@config/app.routes';
import { RefreshTokenError } from '@modules/auth/domain/auth.error';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { resourcesV1 } from '@src/configs/app.permission';
import { ApiErrorResponse } from '@src/libs/api/api-error.response';
import { RefreshTokenResponseDto } from '../../dtos/refresh-token.response.dto';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenRequestDto } from './refresh-token.request.dto';

@Controller(routesV1.version)
export class RefreshTokenHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.AUTH.parent} - ${resourcesV1.AUTH.displayName}`)
  @ApiOperation({
    summary: 'Refresh Token',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: RefreshTokenError.message,
    type: ApiErrorResponse,
  })
  @Post(routesV1.auth.refreshToken)
  async RefreshToken(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const command = new RefreshTokenCommand({
      refreshToken: body.refreshToken,
    });

    return this.commandBus.execute(command);
  }
}
