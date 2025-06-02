import { ApiProperty } from '@nestjs/swagger';
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
