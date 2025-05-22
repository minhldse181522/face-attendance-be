import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class PositionResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'GD',
    description: 'Mã chức vụ',
  })
  code: string;

  @ApiProperty({
    example: 'Nhân viên chính thức',
    description: 'Tên chức vụ',
  })
  positionName: string;

  @ApiProperty({
    example: 15000000,
    description: 'Lương cơ bản (VNĐ)',
  })
  basicSalary: Prisma.Decimal;

  @ApiProperty({
    example: 2000000,
    description: 'Phụ cấp (VNĐ)',
  })
  allowance: Prisma.Decimal;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Lương làm thêm giờ (VNĐ)',
  })
  overtimeSalary?: Prisma.Decimal | null;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Phí đi trễ (VNĐ)',
  })
  lateFee?: Prisma.Decimal | null;
}
