import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum } from '@src/modules/user/domain/user.type';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class FindUserByBranchRequestDto {
  @ApiProperty({
    example: RoleEnum.ADMIN,
    enum: RoleEnum,
    description: 'Filter theo role',
  })
  @IsNotEmpty()
  @MaxLength(20)
  roleCode: RoleEnum;
  @ApiPropertyOptional({
    example: ['B1', 'B2'],
    type: [String],
    description: 'Filter theo branch',
  })
  branchCode?: string[];
}

export class FindPositionByRoleRequestDto {
  @ApiProperty({
    example: 'R1',
    description: 'Filter theo role',
  })
  @IsNotEmpty()
  @MaxLength(20)
  roleCode: string;
}

export class FindBranchByUserCodeRequestDto {
  @ApiProperty({
    example: 'R1',
    description: 'Filter theo user code',
  })
  @IsNotEmpty()
  @MaxLength(20)
  userCode?: string;
}
