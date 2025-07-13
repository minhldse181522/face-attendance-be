import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BangLuongResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'PAY2025070001',
    description: 'Mã bảng lương',
  })
  code: string;

  @ApiProperty({
    example: 'USER2506200002',
    description: 'Mã người dùng',
  })
  userCode: string;

  @ApiProperty({
    example: '07/25',
    description: 'Tháng bảng lương (MM/YY)',
  })
  month: string;

  @ApiProperty({
    example: 8000000,
    description: 'Lương cơ bản',
  })
  baseSalary: number;

  @ApiProperty({
    example: 8000000,
    description: 'Lương cơ bản',
  })
  actualSalary?: number | null;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Các khoản khấu trừ',
  })
  deductionFee?: number | null;

  @ApiProperty({
    example: 22,
    description: 'Số ngày làm việc thực tế',
  })
  workDay: number;

  @ApiProperty({
    example: 1000000,
    description: 'Phụ cấp',
  })
  allowance: number;

  @ApiProperty({
    example: 300000,
    description: 'Lương tăng ca',
  })
  overtimeSalary: number;

  @ApiProperty({
    example: 150000,
    description: 'Tiền phạt đi trễ',
  })
  lateFine: number;

  @ApiPropertyOptional({
    example: 200000,
    description: 'Khoản khác',
  })
  otherFee?: number | null;

  @ApiProperty({
    example: 9600000,
    description: 'Tổng lương thực lĩnh',
  })
  totalSalary: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Tổng số giờ làm',
  })
  totalWorkHour?: number | null;

  @ApiPropertyOptional({
    example: 'NOTPAID',
    description: 'Trạng thái thanh toán',
  })
  status?: string | null;

  @ApiPropertyOptional({
    example: 3,
    description: 'Số lần đi trễ',
  })
  lateTimeCount?: number | null;

  @ApiPropertyOptional({
    example: new Date(),
    description: 'Ngày thanh toán',
  })
  paidDate?: Date | null;
}
