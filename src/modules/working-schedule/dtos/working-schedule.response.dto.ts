import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class WorkingScheduleResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'WS001',
    description: 'Mã lịch làm',
  })
  code?: string | null;

  @ApiProperty({
    example: 'USER001',
    description: 'Mã nhân viên',
  })
  userCode?: string | null;

  @ApiProperty({
    example: '',
    description: 'Mã hợp đồng nhân viên',
  })
  userContractCode?: string | null;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian làm việc',
  })
  date?: Date | null;

  @ApiProperty({
    example: 'SHIFT001',
    description: 'Mã ca làm',
  })
  shiftCode?: string | null;

  @ApiProperty({
    example: 'NOTSTARTED',
    description: 'Trạng thái',
  })
  status?: string | null;

  @ApiProperty({
    example: '',
    description: 'Mã chi nhánh',
  })
  branchCode?: string | null;

  @ApiProperty({
    example: '',
    description: 'Ghi chú',
  })
  note?: string | null;
}
