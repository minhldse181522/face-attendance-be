import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateNotificationRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Tiêu đề',
  })
  @IsOptional()
  @MaxLength(100)
  title?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Thông báo',
  })
  @IsOptional()
  @MaxLength(200)
  message?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Trạng thái',
  })
  @IsOptional()
  @MaxLength(10)
  type?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Trạng thái đọc thông báo',
  })
  isRead?: boolean | null;
}
