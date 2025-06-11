import { Response } from 'express';
import { match } from 'oxide.ts';
import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DownloadCommand } from './download.command';
import { DownloadResult } from './download.service';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';

@Controller(routesV1.version)
export class DownloadHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Download by key' })
  @ApiBearerAuth()
  @ApiTags(`${resourcesV1.UPLOAD.parent} - ${resourcesV1.UPLOAD.name}`)
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.UPLOAD.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.upload.download)
  async directUpload(
    @Query('path') path: string,
    @Res() res: Response,
  ): Promise<unknown> {
    const result: DownloadResult = await this.commandBus.execute(
      new DownloadCommand({ path }),
    );

    return match(result, {
      Ok: ({ filename, contentType, buffer }) => {
        return res
          .header('Content-Type', contentType)
          .header(
            'Content-Disposition',
            `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
          )
          .header('Cross-Origin-Resource-Policy', 'cross-origin')
          .send(buffer);
      },
      Err: (error: Error) => {
        throw new BadRequestException(error);
      },
    });
  }
}
