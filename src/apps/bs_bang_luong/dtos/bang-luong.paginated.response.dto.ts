import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { BangLuongResponseDto } from './bang-luong.response.dto';

export class BangLuongPaginatedResponseDto extends PaginatedResponseDto<BangLuongResponseDto> {
  @ApiProperty({ type: BangLuongResponseDto, isArray: true })
  readonly data: readonly BangLuongResponseDto[];
}
