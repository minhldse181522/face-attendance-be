import { routesV1 } from '@config/app.routes';
import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSignedUrlResponseDto } from './create-signed-url.response.dto';
import { CreateSignedUrlRequestDto } from './create-signed-url.request.dto';
import { CreateSignedUrlCommand } from './create-signed-url.command';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { systemConfig } from '@src/configs/system.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';

@Controller(routesV1.version)
export class CreateSignedUrlHttpController {
  constructor(private readonly commandBus: CommandBus) {}
  @ApiOperation({ summary: 'Create Signed Url' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateSignedUrlResponseDto,
  })
  @ApiTags(`${resourcesV1.UPLOAD.parent} - ${resourcesV1.UPLOAD.name}`)
  @AuthPermission(resourcesV1.UPLOAD.name, resourceScopes.CREATE)
  // @UseGuards(AuthJWTGuard, RolesGuard)
  @Post(routesV1.upload.createSignedUrl)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createSignedUrl(
    @Body() body: CreateSignedUrlRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<CreateSignedUrlResponseDto> {
    try {
      // Kiểm tra xem có file nào được tải lên không
      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      // Validate từng file riêng lẻ
      for (const file of files) {
        // Validate kích thước file
        if (file.size > systemConfig.bodySizeLimit) {
          throw new BadRequestException(
            `File ${file.originalname} exceeds the size limit of ${systemConfig.bodySizeLimit} bytes`,
          );
        }

        // Validate loại file
        const allowedMimeTypes = [
          // Images
          /^image\/.+$/i,
          // PDF
          /^application\/pdf$/i,
          // Word documents
          /^application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$/i,
          /^application\/msword$/i,
          // Excel files
          /^application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet$/i,
          /^application\/vnd\.ms-excel$/i,
          // CSV
          /^text\/csv$/i,
          /^application\/csv$/i,
          // XML
          /^application\/xml$/i,
          /^text\/xml$/i,
        ];

        const isValidFileType = allowedMimeTypes.some((regex) =>
          regex.test(file.mimetype),
        );
        if (!isValidFileType) {
          throw new BadRequestException(
            `File ${file.originalname} is not an allowed file type. Allowed types: images, PDF, Word, Excel, CSV, XML`,
          );
        }
      }

      const fileUpload = [
        {
          soTn: body.soTn,
          files: files,
          fileCount: files.length, // Thêm fileCount nếu cần
        },
      ];

      const command = new CreateSignedUrlCommand({
        fileUpload: fileUpload,
      } as any); // Sử dụng 'as any' để bỏ qua kiểm tra kiểu

      return await this.commandBus.execute(command);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
