import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { ShiftResponseDto } from './shift.response.dto';

export class ShiftPaginatedResponseDto extends PaginatedResponseDto<ShiftResponseDto> {
  @ApiProperty({ type: ShiftResponseDto, isArray: true })
  readonly data: readonly ShiftResponseDto[];
}
