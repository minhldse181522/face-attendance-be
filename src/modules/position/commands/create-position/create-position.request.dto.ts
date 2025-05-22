import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsDecimal, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePositionRequestDto {
  @ApiProperty({
    example: 'CV001',
    description: 'Mã chức vụ',
  })
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Trưởng phòng nhân sự',
    description: 'Tên chức vụ',
  })
  @IsNotEmpty()
  @MaxLength(200)
  positionName: string;

  @ApiProperty({
    example: 15000000,
    description: 'Lương cơ bản',
  })
  @IsNotEmpty()
  @IsDecimal()
  basicSalary: Prisma.Decimal;

  @ApiProperty({
    example: 3000000,
    description: 'Phụ cấp',
  })
  @IsNotEmpty()
  @IsDecimal()
  allowance: Prisma.Decimal;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Lương làm thêm giờ',
  })
  @IsOptional()
  @IsDecimal()
  overtimeSalary?: Prisma.Decimal;

  @ApiPropertyOptional({
    example: 100000,
    description: 'Phí đi muộn',
  })
  @IsOptional()
  @IsDecimal()
  lateFee?: Prisma.Decimal;
}
