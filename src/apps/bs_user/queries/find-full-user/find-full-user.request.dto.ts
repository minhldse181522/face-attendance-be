import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { RoleEnum } from '@src/modules/user/domain/user.type';
import {
  IsOptional,
  MaxLength
} from 'class-validator';

export class FindFullUserInforRequestDto extends FilterDto<Prisma.UserWhereInput> {
  @ApiPropertyOptional({
    example: '',
    enum: RoleEnum,
    description: 'Filter theo role',
  })
  @IsOptional()
  @MaxLength(20)
  role?: RoleEnum;

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
