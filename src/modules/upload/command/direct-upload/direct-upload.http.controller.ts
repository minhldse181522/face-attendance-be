import { resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { RateLimit } from '@libs/rate-limit/rate-limit.guard';
import {
  FileSizeValidator,
  FileTypeValidator,
} from '@libs/utils/file-validator.util';
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { systemConfig } from '@src/configs/system.config';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { DirectUploadCommand } from './direct-upload.command';
import { DirectUploadDto } from './direct-upload.request.dto';
import { DirectUploadResult } from './direct-upload.service';

@Controller(routesV1.version)
export class DirectUploadHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Direct upload' })
  @ApiBearerAuth()
  @ApiTags(`${resourcesV1.UPLOAD.parent} - ${resourcesV1.UPLOAD.name}`)
  @ApiBody({ type: DirectUploadDto })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          example: 'face/user123.png',
        },
        userCode: {
          type: 'string',
          example: 'U001',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @RateLimit(systemConfig.uploadRateLimit)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: systemConfig.uploadFileSize, // Use specific upload file size limit
        fieldSize: systemConfig.bodySizeLimit,
      },
    }),
  )
  @Post(routesV1.upload.directUpload)
  async directUpload(
    @Body() body: DirectUploadDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileSizeValidator({
            multiple: false,
            maxSizeBytes: systemConfig.uploadFileSize, // Use specific upload size limit
          }),
          new FileTypeValidator({
            multiple: false,
            filetype: /^image\/.+$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    const command = new DirectUploadCommand({ ...body, file });
    const result: DirectUploadResult = await this.commandBus.execute(command);

    return match(result, {
      Ok: () => 'Upload thành công',
      Err: (error: Error) => {
        throw new BadRequestException(error);
      },
    });
  }
}
