import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { FilterDto } from '@src/libs/application/validators/prisma-filter.validator';
import { RoleEnum } from '../../domain/user.type';
import { IsOptional, MaxLength } from 'class-validator';

export class FindUserRequestDto extends FilterDto<Prisma.UserWhereInput> {
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
    description: 'Filter theo position',
  })
  @IsOptional()
  @MaxLength(50)
  positionCode?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo branch',
  })
  @IsOptional()
  @MaxLength(50)
  branchCode?: string;

  @ApiPropertyOptional({
    example: '',
    description: 'Filter theo trạng thái tài khoản',
  })
  @IsOptional()
  isActive?: boolean;
}
