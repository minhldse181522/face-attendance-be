import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateShiftRequestDto {
  @ApiPropertyOptional({
    example: 'Ca sáng',
    description: 'Ca làm',
  })
  @IsOptional()
  @MaxLength(100)
  name?: string | null;

  @ApiPropertyOptional({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Thời gian bắt đầu',
  })
  @IsOptional()
  @IsDateString()
  startTime?: Date | null;

  @ApiPropertyOptional({
    example: '2023-01-01T18:00:00.000Z',
    description: 'Thời gian kết thúc',
  })
  @IsOptional()
  @IsDateString()
  endTime?: Date | null;

  @ApiPropertyOptional({
    example: '01:00',
    description: 'Giờ nghỉ trưa',
  })
  @IsOptional()
  @MaxLength(10)
  lunchBreak?: string | null;
}
