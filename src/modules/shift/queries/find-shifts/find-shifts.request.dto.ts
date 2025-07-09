import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional } from 'class-validator';
import { ShiftStatusEnum } from '../../domain/shift.type';

export class FindShiftRequestDto extends FilterDto<Prisma.ShiftWhereInput> {
  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo ca làm',
  })
  @IsOptional()
  status?: ShiftStatusEnum;
}
