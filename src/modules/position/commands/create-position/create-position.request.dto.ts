import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreatePositionRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Tên vai trò',
  })
  @IsOptional()
  @MaxLength(100)
  positionName?: string | null;

  @ApiProperty({
    example: '',
    description: 'Tên vai trò',
  })
  @IsNotEmpty()
  @MaxLength(5)
  role: string;

  @ApiPropertyOptional({
    example: 'Admin',
    description: 'Mô tả vai trò',
  })
  @IsOptional()
  @MaxLength(100)
  description?: string | null;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Mức lương cơ bản',
  })
  @IsOptional()
  @IsNumber()
  baseSalary?: number | null;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Trợ cấp',
  })
  @IsOptional()
  @IsNumber()
  allowance?: number | null;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Lương làm thêm',
  })
  @IsOptional()
  @IsNumber()
  overtimeSalary?: number | null;

  @ApiPropertyOptional({
    example: 1000,
    description: 'Phí trễ',
  })
  @IsOptional()
  @IsNumber()
  lateFine?: number | null;
}
