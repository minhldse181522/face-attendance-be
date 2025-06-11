import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { ImageStorageResponseDto } from './image-storage.response.dto';

export class ImageStoragePaginatedResponseDto extends PaginatedResponseDto<ImageStorageResponseDto> {
  @ApiProperty({ type: ImageStorageResponseDto, isArray: true })
  readonly data: readonly ImageStorageResponseDto[];
}
