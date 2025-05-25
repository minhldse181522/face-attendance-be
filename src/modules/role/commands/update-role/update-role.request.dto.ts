import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';

export class UpdateRoleRequestDto {
  @ApiPropertyOptional({
    example: 'R1',
    description: 'Mã vai trò',
  })
  @IsOptional()
  @MaxLength(50)
  roleCode?: string | null;

  @ApiPropertyOptional({
    example: 'Admin',
    description: 'Tên vai trò',
  })
  @IsOptional()
  @MaxLength(200)
  roleName?: string | null;
}
