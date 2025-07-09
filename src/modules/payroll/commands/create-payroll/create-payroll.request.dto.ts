import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollRequestDto {
  @ApiProperty({
    example: 'USER2506200002',
    description: 'Mã người dùng',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;

  @ApiProperty({
    example: '07',
    description: 'Tháng bảng lương',
  })
  @IsNotEmpty()
  @MaxLength(10)
  month: string;

  @ApiProperty({
    example: 8000000,
    description: 'Lương cơ bản',
  })
  @IsNotEmpty()
  baseSalary: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Các khoản khấu trừ',
  })
  @IsOptional()
  deductionFee?: number | null;

  @ApiProperty({
    example: 22,
    description: 'Số ngày làm việc thực tế',
  })
  @IsNotEmpty()
  workDay: number;

  @ApiProperty({
    example: 1000000,
    description: 'Phụ cấp',
  })
  @IsNotEmpty()
  allowance: number;

  @ApiProperty({
    example: 300000,
    description: 'Lương tăng ca',
  })
  @IsNotEmpty()
  overtimeSalary: number;

  @ApiProperty({
    example: 150000,
    description: 'Tiền phạt đi trễ',
  })
  @IsNotEmpty()
  lateFine: number;

  @ApiPropertyOptional({
    example: 200000,
    description: 'Khoản khác',
  })
  @IsOptional()
  otherFee?: number | null;

  @ApiProperty({
    example: 9600000,
    description: 'Tổng lương thực lĩnh',
  })
  @IsNotEmpty()
  totalSalary: number;
}
