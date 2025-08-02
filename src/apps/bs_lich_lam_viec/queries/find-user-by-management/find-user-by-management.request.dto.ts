import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class FindUserByManagementRequestDto extends FilterDtoWithQuickSearch<Prisma.UserWhereInput> {
  @ApiProperty({
    example: 'USER0001',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  @MaxLength(50)
  userCode?: string;
}
