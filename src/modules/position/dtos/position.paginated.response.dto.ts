import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { PositionResponseDto } from './position.response.dto';

export class PositionPaginatedResponseDto extends PaginatedResponseDto<PositionResponseDto> {
  @ApiProperty({ type: PositionResponseDto, isArray: true })
  readonly data: readonly PositionResponseDto[];
}
