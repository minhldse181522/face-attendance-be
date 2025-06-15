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
    example: 'NOTSTARTED',
    description: 'Trạng thái',
  })
  status?: string | null;

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
    example: 'HANOI',
    description: 'Mã chi nhánh',
  })
  branchCode?: string | null;

  @ApiProperty({
    example: 'HANOI',
    description: 'Tên chi nhánh',
  })
  branchName?: string | null;

  @ApiProperty({
    example: 'HANOI',
    description: 'Địa chỉ',
  })
  addressLine?: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian vào ca làm',
  })
  startShiftTime?: string | null;

  @ApiProperty({
    example: 'Giám Đốc Chi Nhánh',
    description: 'Tên chức vụ',
  })
  positionName?: string | null;

  @ApiProperty({
    example: 'Phụ Anh Tám',
    description: 'Tên người quản lý',
  })
  managerFullName?: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian ra ca làm',
  })
  endShiftTime?: string | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian vào chấm công',
  })
  checkInTime?: Date | null;

  @ApiProperty({
    example: new Date(),
    description: 'Thời gian ra chấm công',
  })
  checkOutTime?: Date | null;

  @ApiProperty({
    example: '',
    description: 'Trạng thái chấm công',
  })
  statusTimeKeeping?: string | null;
}
