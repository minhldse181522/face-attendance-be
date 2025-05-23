import { ResponseBase } from '@libs/api/response.base';
import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto extends ResponseBase<any> {
  @ApiProperty({
    example: 'R1',
    description: 'Mã vai trò',
  })
  roleCode: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Tên vai trò',
  })
  roleName: string;
}
