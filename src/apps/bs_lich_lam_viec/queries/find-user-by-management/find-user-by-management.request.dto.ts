import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class FindUserByManagementRequestDto extends FilterDtoWithQuickSearch<Prisma.UserWhereInput> {
  @ApiProperty({
    example: 'USER0001',
    description: 'Mã nhân viên',
  })
  @IsNotEmpty()
  @MaxLength(50)
  userCode: string;
}
