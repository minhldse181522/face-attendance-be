import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteObjectCommand } from './delete-object.command';
import { routesV1 } from '@src/configs/app.routes';
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { DeleteObjectRequestDto } from './delete-object.request.dto';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';

@Controller(routesV1.version)
export class DeleteObjectHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiTags(`${resourcesV1.UPLOAD.parent} - ${resourcesV1.UPLOAD.name}`)
  @ApiOperation({ summary: 'Delete Object' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Object deleted',
  })
  // @AuthPermission(
  //   [
  //     resourcesV1.UPLOAD.name,
  //     resourcesV1.SURVEY.name,
  //     resourcesV1.ESTIMATE.name,
  //     resourcesV1.XAC_NHAN_VE_SINH.name,
  //     resourcesV1.JOB_REPAIR_CLEAN.name,
  //     resourcesV1.QUAN_LY_VSSC.name,
  //     resourcesV1.UPDATE_SURVEY_DATA.name,
  //   ],
  //   resourceScopes.DELETE,
  // )
  @AuthPermission(resourcesV1.UPLOAD.name, resourceScopes.DELETE)
  @UseGuards(JwtAuthGuard)
  @Delete(routesV1.upload.deleteObject)
  async delete(@Body() body: DeleteObjectRequestDto): Promise<void> {
    const command = new DeleteObjectCommand({
      ...body,
    });
    return await this.commandBus.execute(command);
  }
}
