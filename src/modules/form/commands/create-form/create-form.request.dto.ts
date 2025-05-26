import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormRequestDto {
  @ApiProperty({
    example: 'DTC-001',
    description: 'Tiêu đề đơn',
  })
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'Đơn tăng ca',
    description: 'Mô tả đơn',
  })
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'R1',
    description: 'Mã vai trò duyệt đơn',
  })
  @IsNotEmpty()
  @MaxLength(50)
  roleCode: string;
}
