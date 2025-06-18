import { DirectFilterPipe } from '@chax-at/prisma-filter';
import { resourceScopes, resourcesV1 } from '@config/app.permission';
import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';
import { JwtAuthGuard } from '@src/modules/auth/guards/auth.guard';
import { FaceReferencePaginatedResponseDto } from '../../dtos/reference.paginated.response.dto';
import { FaceReferenceMapper } from '../../mappers/reference.mapper';
import { FindFaceReferenceQuery } from './find-references.query-handler';
import { FindFaceReferenceRequestDto } from './find-references.request.dto';

@Controller(routesV1.version)
export class FindFaceReferenceHttpController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly mapper: FaceReferenceMapper,
  ) {}
  @ApiTags(
    `${resourcesV1.FACE_REFERENCE.parent} - ${resourcesV1.FACE_REFERENCE.displayName}`,
  )
  @ApiOperation({ summary: 'Lấy danh sách khuôn mặt' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: FaceReferencePaginatedResponseDto,
  })
  @AuthPermission(resourcesV1.FACE_REFERENCE.name, resourceScopes.VIEW)
  @UseGuards(JwtAuthGuard)
  @Get(routesV1.tacVu.faceReference.root)
  async findFaceReference(
    @Query(new DirectFilterPipe<any, Prisma.FaceReferenceWhereInput>([]))
    queryParams: FindFaceReferenceRequestDto,
  ): Promise<FaceReferencePaginatedResponseDto> {
    const result = await this.queryBus.execute(
      new FindFaceReferenceQuery(queryParams.findOptions),
    );

    const paginated = result.unwrap();

    return new FaceReferencePaginatedResponseDto({
      ...paginated,
      data: paginated.data.map(this.mapper.toResponse),
    });
  }
}
