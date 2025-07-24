import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class ShiftResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  code?: string | null;

  @ApiProperty({
    example: 'Ca sáng',
    description: 'Ca làm',
  })
  name?: string | null;

  @ApiProperty({
    example: '2023-01-01T07:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  startTime?: Date | null;

  @ApiProperty({
    example: '2023-01-01T18:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  endTime?: Date | null;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Trạng thái ca làm',
  })
  status?: string | null;

  @ApiProperty({
    example: '01:00',
    description: 'Khoảng thời gian nghỉ trưa',
  })
  lunchBreak?: string | null;

  @ApiProperty({
    example: 7,
    description: 'Thời gian làm việc',
  })
  workingHours?: Decimal | null;
}
