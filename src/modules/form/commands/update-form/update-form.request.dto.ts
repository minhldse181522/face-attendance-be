import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateFormRequestDto {
  @ApiPropertyOptional({
    example: 'DTC-001',
    description: 'Tiêu đề đơn',
  })
  @IsOptional()
  @MaxLength(200)
  title?: string | null;

  @ApiPropertyOptional({
    example: 'Đơn tăng ca',
    description: 'Mô tả đơn',
  })
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({
    example: 'R1',
    description: 'Mã vai trò duyệt đơn',
  })
  @IsOptional()
  @MaxLength(50)
  roleCode?: string | null;
}
