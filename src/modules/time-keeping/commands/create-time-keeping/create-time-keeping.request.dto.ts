import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateTimeKeepingRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Thời gian ra',
  })
  @IsOptional()
  @IsDateString()
  checkInTime?: Date | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Thời gian ra',
  })
  @IsOptional()
  @IsDateString()
  checkOutTime?: Date | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Ngày',
  })
  @IsOptional()
  @IsDateString()
  date?: Date | null;

  @ApiPropertyOptional({
    example: '',
    description: 'Trạng thái',
  })
  @IsOptional()
  @MaxLength(100)
  status?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: '',
  })
  @IsOptional()
  @MaxLength(20)
  userCode?: string | null;

  @ApiPropertyOptional({
    example: '',
    description: '',
  })
  @IsOptional()
  @MaxLength(20)
  workingScheduleCode?: string | null;
}
