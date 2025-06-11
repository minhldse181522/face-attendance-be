import { routesV1 } from '@config/app.routes';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { resourceScopes, resourcesV1 } from '@src/configs/app.permission';
import { GetObjectInBucketResponseDto } from './get-object-in-bucket.response.dto';
import {
  GetObjectInBucketQuery,
  GetObjectInBucketService,
} from './get-object-in-bucket.service';
import { AuthPermission } from '@src/libs/decorators/auth-permissions.decorator';

@Controller(routesV1.version)
export class GetObjectInBucketHttpController {
  constructor(
    private readonly getObjectInBucketService: GetObjectInBucketService,
  ) {}
  @ApiOperation({ summary: 'Get Object In bucket' })
  @ApiQuery({
    name: 'soTn',
    description: 'Số tiếp nhận',
    type: 'string',
    required: true,
    example: 'ABCD123456789',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetObjectInBucketResponseDto,
  })
  @ApiTags(`${resourcesV1.UPLOAD.parent} - ${resourcesV1.UPLOAD.name}`)
  @AuthPermission(resourcesV1.UPLOAD.name, resourceScopes.VIEW)
  // @UseGuards(AuthJWTGuard, RolesGuard)
  @Get(routesV1.upload.getObject)
  async GetObjectInBucket(
    @Query()
    queryParam: {
      soTn: string;
    },
  ): Promise<GetObjectInBucketResponseDto[]> {
    const query = new GetObjectInBucketQuery(queryParam.soTn);
    return await this.getObjectInBucketService.execute(query);
  }
}
