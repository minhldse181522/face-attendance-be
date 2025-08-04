import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponse } from '@src/libs/api/api-error.response';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { ReqUser } from '@src/libs/decorators/request-user.decorator';
import { MinioService } from '@src/libs/minio/minio.service';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { FormDescriptionEntity } from '@src/modules/form-description/domain/form-description.entity';
import {
  FormDescriptionAlreadyExistsError,
  FormDescriptionInvalidStatusError,
} from '@src/modules/form-description/domain/form-description.error';
import { FormDescriptionResponseDto } from '@src/modules/form-description/dtos/form-description.response.dto';
import { FormDescriptionMapper } from '@src/modules/form-description/mappers/form-description.mapper';
import { match } from 'oxide.ts';
import { TaoDonRequestDto } from './tao-don.request.dto';
import { TaoDonCommand } from './tao-don.command';
import { TaoDonCommandResult } from './tao-don.service';
import { FormNotFoundError } from '@src/modules/form/domain/form.error';

@Controller(routesV1.version)
export class XuLiDonHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: FormDescriptionMapper,
    private readonly minioService: MinioService,
  ) {}

  @ApiTags(`${resourcesV1.BS_DON.parent} - ${resourcesV1.BS_DON.displayName}`)
  @ApiOperation({ summary: 'Tạo mới đơn' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Form description created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: FormDescriptionAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @AuthPermission(resourcesV1.BS_DON.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.businessLogic.don.taoDon)
  @UseInterceptors(FileInterceptor('file'))
  async xuLiDon(
    @UploadedFile() file: Express.Multer.File,
    @ReqUser() user: RequestUser,
    @Body() body: TaoDonRequestDto,
  ): Promise<FormDescriptionResponseDto> {
    let imagePath = body.file;
    if (file) {
      const tempPath = `temp/${user.code}_${Date.now()}.jpg`;
      await this.minioService.putObject(tempPath, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
      const publicUrl = `${this.minioService.getPublicEndpoint()}/${this.minioService['_bucketName']}/${tempPath}`;
      imagePath = publicUrl;
    }

    const command = new TaoDonCommand({
      ...body,
      status: body.status || 'PENDING',
      createdBy: user.userName,
      file: imagePath,
      submittedBy: user.code,
      startTime: body.startTime,
      endTime: body.endTime,
      formId: body.formId,
    });
    const result: TaoDonCommandResult = await this.commandBus.execute(command);

    return match(result, {
      Ok: (form: FormDescriptionEntity) => this.mapper.toResponse(form),
      Err: (error: Error) => {
        if (
          error instanceof FormDescriptionAlreadyExistsError ||
          error instanceof FormDescriptionInvalidStatusError ||
          error instanceof FormNotFoundError
        ) {
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
