import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional } from 'class-validator';

export class FindBangLuongRequestDto extends FilterDto<Prisma.PayrollWhereInput> {
  @ApiPropertyOptional({
    example: '',
    description: 'Tháng',
  })
  @IsOptional()
  month?: number;
}
