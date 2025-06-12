import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { FaceReferenceResponseDto } from './reference.response.dto';

export class FaceReferencePaginatedResponseDto extends PaginatedResponseDto<FaceReferenceResponseDto> {
  @ApiProperty({ type: FaceReferenceResponseDto, isArray: true })
  readonly data: readonly FaceReferenceResponseDto[];
}
