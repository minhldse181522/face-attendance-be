import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { now } from 'lodash';
export class FindFormDescriptionFilterRequestDto extends FilterDtoWithQuickSearch<Prisma.FormDescriptionWhereInput> {
  // Add more properties here
  @ApiPropertyOptional({
    example: new Date(now()),
    description: 'Từ ngày',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: new Date(now()),
    description: 'Đến ngày',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'ID của form',
  })
  @IsOptional()
  @IsString()
  formId?: string;
}
