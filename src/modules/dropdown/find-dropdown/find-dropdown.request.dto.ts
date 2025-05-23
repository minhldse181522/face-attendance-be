import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from '@src/modules/user/domain/user.type';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class FindUserByBranchRequestDto {
  @ApiProperty({
    example: 'CN001',
    description: 'chi nhánh',
  })
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;

  @ApiPropertyOptional({
    example: RoleEnum.ADMIN,
    enum: RoleEnum,
    description: 'Filter theo role',
  })
  @IsNotEmpty()
  @MaxLength(20)
  roleCode: RoleEnum;
}
