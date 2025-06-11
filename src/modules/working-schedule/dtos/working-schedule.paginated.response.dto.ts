import { PaginatedResponseDto } from '@libs/api/paginated.response.base';
import { ApiProperty } from '@nestjs/swagger';
import { WorkingScheduleResponseDto } from './working-schedule.response.dto';

export class WorkingSchedulePaginatedResponseDto extends PaginatedResponseDto<WorkingScheduleResponseDto> {
  @ApiProperty({ type: WorkingScheduleResponseDto, isArray: true })
  readonly data: readonly WorkingScheduleResponseDto[];
}
