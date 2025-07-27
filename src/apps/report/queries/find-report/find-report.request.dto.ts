import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FindReportRequestDto {
  @ApiPropertyOptional({
    example: '',
    description: 'Tháng',
  })
  @IsOptional()
  month?: string;
}
