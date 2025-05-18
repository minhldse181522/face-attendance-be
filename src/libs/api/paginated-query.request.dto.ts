import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedQueryRequestDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Specifies a limit of returned records',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99_999)
  @Type(() => Number)
  readonly limit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99_999)
  @Type(() => Number)
  readonly page?: number;
}
