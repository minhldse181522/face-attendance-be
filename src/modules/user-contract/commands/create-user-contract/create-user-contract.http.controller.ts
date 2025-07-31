import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { ReqUser } from '@libs/decorators/request-user.decorator';
import {
  BadRequestException,
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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { RequestUser } from '@src/modules/auth/domain/value-objects/request-user.value-objects';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { match } from 'oxide.ts';
import { UserContractEntity } from '../../domain/user-contract.entity';
import { UserContractAlreadyExistsError } from '../../domain/user-contract.error';
import { UserContractResponseDto } from '../../dtos/user-contract.response.dto';
import { UserContractMapper } from '../../mappers/user-contract.mapper';
import { CreateUserContractCommand } from './create-user-contract.command';
import { CreateUserContractRequestDto } from './create-user-contract.request.dto';
import { CreateUserContractServiceResult } from './create-user-contract.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { MinioService } from '@src/libs/minio/minio.service';

@Controller(routesV1.version)
export class CreateUserContractHttpController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly mapper: UserContractMapper,
    private readonly minioService: MinioService,
  ) {}

  @ApiTags(
    `${resourcesV1.USER_CONTRACT.parent} - ${resourcesV1.USER_CONTRACT.displayName}`,
  )
  @ApiOperation({
    summary: 'Create a user contract',
    description:
      'Upload a PDF contract file and create user contract. Only PDF files are accepted.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: UserContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: UserContractAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @UseInterceptors(
    FileInterceptor('contractPdf', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Chỉ cho phép file PDF
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @AuthPermission(resourcesV1.USER_CONTRACT.name, resourceScopes.CREATE)
  @UseGuards(JwtAuthGuard)
  @Post(routesV1.tacVu.userContract.root)
  async create(
    @ReqUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateUserContractRequestDto,
  ): Promise<UserContractResponseDto> {
    let fileUrl: string | null = null;

    if (file) {
      try {
        // ✅ 1. Validate file extension
        const allowedExtensions = ['pdf'];
        const extension = file.originalname.split('.').pop()?.toLowerCase();

        if (!extension || !allowedExtensions.includes(extension)) {
          throw new BadRequestException('Only PDF files are allowed');
        }

        // ✅ 2. Tạo object name duy nhất với timestamp và UUID
        const timestamp = Date.now();
        const uuid = randomUUID();
        const fileName = `contracts/${timestamp}-${uuid}.${extension}`;

        // ✅ 3. Upload file lên Minio với metadata
        await this.minioService.putObject(fileName, file.buffer, file.size, {
          'Content-Type': file.mimetype,
          'Original-Name': file.originalname,
          'Upload-Date': new Date().toISOString(),
          'Uploaded-By': user.userName,
        });

        // ✅ 4. Tạo URL công khai
        fileUrl = `${this.minioService.getPublicEndpoint()}/${this.minioService.getBucketName()}/${fileName}`;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(
          'Failed to upload file: ' + error.message,
        );
      }
    }
    const command = new CreateUserContractCommand({
      ...body,
      contractPdf: fileUrl,
      startTime: body.startTime ? new Date(body.startTime) : undefined,
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      createdBy: user.userName,
    });

    const result: CreateUserContractServiceResult =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (userContract: UserContractEntity) =>
        this.mapper.toResponse(userContract),
      Err: (error: Error) => {
        if (error instanceof UserContractAlreadyExistsError) {
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
