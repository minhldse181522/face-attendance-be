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
    example: 7,
    description: 'Thời gian làm',
  })
  @IsOptional()
  @MaxLength(100)
  workingHours?: number | null;

  @ApiPropertyOptional({
    example: '2023-01-01T18:00:00.000Z',
    description: 'Thời gian đi trễ',
  })
  @IsOptional()
  @IsDateString()
  delayTime?: Date | null;
}
