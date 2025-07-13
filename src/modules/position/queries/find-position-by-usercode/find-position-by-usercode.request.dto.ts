import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional } from 'class-validator';

export class FindPositionRequestDto extends FilterDto<Prisma.PositionWhereInput> {
  @ApiPropertyOptional({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  userCode?: string;
}
