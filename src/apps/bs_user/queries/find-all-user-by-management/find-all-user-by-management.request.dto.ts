import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  FilterDto,
  FilterDtoWithQuickSearch,
} from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional, IsString } from 'class-validator';

export class FindAllUserByManagementRequestDto extends FilterDtoWithQuickSearch<Prisma.UserWhereInput> {
  @ApiPropertyOptional({
    example: '',
    description: 'Mã nhân viên',
  })
  @IsOptional()
  userCode?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo trạng thái tài khoản',
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo chức vụ',
  })
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo chi nhánh',
  })
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({
    description: 'Quick search term for filtering users',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  quickSearch?: string;
}
