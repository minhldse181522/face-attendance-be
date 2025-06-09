import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class LichLamViecResponseDto extends ResponseBase<any> {
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
    example: 'HEHE',
    description: 'Tên nhân viên',
  })
  fullName?: string | null;

  @ApiProperty({
    example: 'HUHU',
    description: 'Tên ca làm',
  })
  shiftName?: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian bắt đầu hợp đồng',
  })
  contractStartTime?: Date | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian kết thúc hợp đồng',
  })
  contractEndTime?: Date | null;
}
