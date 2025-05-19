import { routesV1 } from '@config/app.routes';
import { LoginError } from '@modules/auth/domain/auth.error';
import { LoginResponseDto } from '@modules/auth/dtos/login.response.dto';
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
import { LoginCommand } from './login.command';
import { LoginRequestDto } from './login.request.dto';

@Controller(routesV1.version)
export class LoginHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.AUTH.parent} - ${resourcesV1.AUTH.displayName}`)
  @ApiOperation({
    summary: 'Login',
    description: 'input username and password to login',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: LoginError.message,
    type: ApiErrorResponse,
  })
  @Post(routesV1.auth.login)
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    const command = new LoginCommand({
      username: body.username,
      password: body.password,
    });

    return this.commandBus.execute(command);
  }
}
