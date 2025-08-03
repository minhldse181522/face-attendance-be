import { Prisma } from '@prisma/client';
import { FilterDtoWithQuickSearch } from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindNotificationsRequestDto extends FilterDtoWithQuickSearch<Prisma.NotificationWhereInput> {
  @ApiPropertyOptional({
    example: 'USER001',
    description: 'Mã người dùng',
  })
  @IsOptional()
  @IsString()
  userCode?: string;
}
