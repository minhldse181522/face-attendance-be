import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { IsOptional } from 'class-validator';

export class FindAllUserByManagementRequestDto extends FilterDto<Prisma.UserWhereInput> {
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
}
