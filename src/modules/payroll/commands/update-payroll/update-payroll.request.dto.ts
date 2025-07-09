import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdatePayrollRequestDto {
  @ApiPropertyOptional({
    example: 'USER2506200002',
    description: 'Mã người dùng',
  })
  @IsOptional()
  @MaxLength(50)
  userCode?: string;

  @ApiPropertyOptional({
    example: '07',
    description: 'Tháng bảng lương',
  })
  @IsOptional()
  @MaxLength(10)
  month?: string;

  @ApiPropertyOptional({
    example: 8000000,
    description: 'Lương cơ bản',
  })
  @IsOptional()
  baseSalary?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Các khoản khấu trừ',
  })
  @IsOptional()
  deductionFee?: number | null;

  @ApiPropertyOptional({
    example: 22,
    description: 'Số ngày làm việc thực tế',
  })
  @IsOptional()
  workDay?: number;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Phụ cấp',
  })
  @IsOptional()
  allowance?: number;

  @ApiPropertyOptional({
    example: 300000,
    description: 'Lương tăng ca',
  })
  @IsOptional()
  overtimeSalary?: number;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Tiền phạt đi trễ',
  })
  @IsOptional()
  lateFine?: number;

  @ApiPropertyOptional({
    example: 200000,
    description: 'Khoản khác',
  })
  @IsOptional()
  otherFee?: number | null;

  @ApiPropertyOptional({
    example: 9600000,
    description: 'Tổng lương thực lĩnh',
  })
  @IsOptional()
  totalSalary?: number;
}
