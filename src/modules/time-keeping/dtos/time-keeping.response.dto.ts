import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class TimeKeepingResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: '',
    description: '',
  })
  code?: string | null;

  @ApiProperty({
    example: 'Ca sáng',
    description: 'Thời gian checkin',
  })
  checkInTime?: Date | null;

  @ApiProperty({
    example: '2023-01-01T07:00:00.000Z',
    description: 'Thời gian checkout',
  })
  checkOutTime?: Date | null;

  @ApiProperty({
    example: '2023-01-01T18:00:00.000Z',
    description: 'Ngày',
  })
  date?: Date | null;

  @ApiProperty({
    example: '',
    description: '',
  })
  status?: string | null;

  @ApiProperty({
    example: '',
    description: '',
  })
  userCode?: string | null;

  @ApiProperty({
    example: '',
    description: '',
  })
  workingScheduleCode?: string | null;
}
