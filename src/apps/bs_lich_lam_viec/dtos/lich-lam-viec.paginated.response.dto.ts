import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { LichLamViecResponseDto } from './lich-lam-viec.response.dto';

export class LichLamViecPaginatedResponseDto extends PaginatedResponseDto<LichLamViecResponseDto> {
  @ApiProperty({ type: LichLamViecResponseDto, isArray: true })
  readonly data: readonly LichLamViecResponseDto[];
}
