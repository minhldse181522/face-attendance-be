import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { LichChamCongResponseDto } from './lich-cham-cong.response.dto';

export class LichChamCongPaginatedResponseDto extends PaginatedResponseDto<LichChamCongResponseDto> {
  @ApiProperty({ type: LichChamCongResponseDto, isArray: true })
  readonly data: readonly LichChamCongResponseDto[];
}
