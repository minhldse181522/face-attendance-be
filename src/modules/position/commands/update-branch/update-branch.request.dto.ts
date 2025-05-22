import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDecimal, IsOptional, MaxLength } from 'class-validator';

export class UpdatePositionRequestDto {
  @ApiPropertyOptional({
    example: 'CV001',
    description: 'Mã chức vụ',
  })
  @IsOptional()
  @MaxLength(50)
  code?: string | null;

  @ApiPropertyOptional({
    example: 'Trưởng phòng nhân sự',
    description: 'Tên chức vụ',
  })
  @IsOptional()
  @MaxLength(200)
  positionName?: string | null;

  @ApiPropertyOptional({
    example: 15000000,
    description: 'Lương cơ bản',
  })
  @IsOptional()
  @IsDecimal()
  basicSalary?: Prisma.Decimal | null;

  @ApiPropertyOptional({
    example: 3000000,
    description: 'Phụ cấp',
  })
  @IsOptional()
  @IsDecimal()
  allowance?: Prisma.Decimal | null;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Lương làm thêm giờ',
  })
  @IsOptional()
  @IsDecimal()
  overtimeSalary?: Prisma.Decimal | null;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Phí đi muộn',
  })
  @IsOptional()
  @IsDecimal()
  lateFee?: Prisma.Decimal | null;
}
