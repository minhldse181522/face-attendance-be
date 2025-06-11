import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { TimeKeepingResponseDto } from './time-keeping.response.dto';

export class TimeKeepingPaginatedResponseDto extends PaginatedResponseDto<TimeKeepingResponseDto> {
  @ApiProperty({ type: TimeKeepingResponseDto, isArray: true })
  readonly data: readonly TimeKeepingResponseDto[];
}
