import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleRequestDto {
  @ApiProperty({
    example: 'R1',
    description: 'Mã vai trò',
  })
  @IsNotEmpty()
  @MaxLength(5)
  roleCode: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Tên vai trò',
  })
  @IsNotEmpty()
  @MaxLength(20)
  roleName: string;
}
